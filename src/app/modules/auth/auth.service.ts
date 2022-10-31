import { Injectable } from '@angular/core';
import { SettingsService } from '@modules/root/settings/settings.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import {
  authStatuses,
  AuthMessage,
  PinCode,
  SignInRequest,
  AuthMessageCode,
  SignInResponse,
  AuthPermissionsData,
  AuthPermissionName,
  StartBlockName,
  startBlockNames,
  authPermissionNames,
  SignInDataCASData,
  CheckOpenIDSessionResponse,
  OpenIdAnyResponse,
  OpenIDSessionDataResponse,
} from './auth.interface';
import { SHA1, enc } from "crypto-js";
import { v4 as uuid } from "uuid";
import { ApiService } from '@modules/root/api/api.service';
import { APIServiceName, APIServiceNames, BaseResponse } from '@modules/root/api/api.interface';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AlertService } from '@modules/root/alert/alert.service';
import { EmptyClass } from '@shared/common.interface';
import { CookieService } from 'ngx-cookie-service';
import { CurrentUserDescription, UserDescription } from '@modules/user/user.interface';
import { environment } from '@environments/environment';
import { LocationTools } from '@modules/root/location/location.class';
import { AuthenticationSettings, CloseSessionRequest } from '@modules/root/settings/settings.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private onChange$: BehaviorSubject<authStatuses> = new BehaviorSubject(authStatuses.UNKNOWN);
  public OnChange$: Observable<authStatuses> = this.onChange$.asObservable();

  private onGetMessage$: Subject<AuthMessage> = new Subject();
  public OnGetMessage$: Observable<AuthMessage> = this.onGetMessage$.asObservable();

  private onChangeUserData$: BehaviorSubject<CurrentUserDescription> = new BehaviorSubject(this.userDescription());
  public OnChangeUserData$: Observable<CurrentUserDescription> = this.onChangeUserData$.asObservable();

  private versionAPI = "2.0.2";
  private passwordHash: string;
  private clientID: string;
  private session: string;

  private user: string;
  private login: string;
  private permissions: AuthPermissionsData;
  private typeSession: string;

  private userName: string;
  private avatar: string;
  private rndAvatarParam: string;
  private authSettings: AuthenticationSettings;

  private tabUUID: string;

  constructor(
    private settings: SettingsService,
    private cookieService: CookieService,
    private api: ApiService,
    private err: ErrorsService,
    private as: AlertService,
    private http: HttpClient,
    ) {

    this.authSettings = this.settings.Authentication();

    if (this.authSettings.openid.available || this.authSettings.os?.available) {
      this.declareOpenIDGlobalAPI();
    }

    this.session = this.cookieService.get(settings.StorageName("session"));

    if (this.session) {

      this.user = this.getItem<string>("user", false);
      this.login = this.getItem<string>("login", false);
      this.clientID = this.getItem<string>("clientID", false);
      this.passwordHash = this.getItem<string>("passwordHash", false);
      this.permissions = this.getItem<AuthPermissionsData>("permissions", true);
      this.typeSession = this.getItem<string>("typeSession", false);
      this.userName = this.getItem<string>("userName", false);
      this.avatar = this.getItem<string>("avatar", false);

      this.onChangeUserData$.next(this.userDescription());
      this.onChange$.next(authStatuses.AUTHENTICATED);

      if (this.onlyOpenID() && this.authSettings.openid.checkOnLoad) {
        this.checkOpenID(); // Проверяем есть ли авторизация openid и если нет будет выполнен выход.
      }

    } else {

      this.onChange$.next(authStatuses.NOT_AUTHENTICATED);

      if (this.authSettings.cas.available) {
        this.submitResponseFromCASServer();
      }

      if (this.onlyOpenID() && this.authSettings.openid.available) {
        this.lookupOpenID(); // Проверяем есть ли авторизация openid и если есть будет выполнен вход.
      }

    }

    this.err.OnGetSessionError$.subscribe(() => this.SignOut());

  }

  public loginToCAS() {
    const CASSettings = this.authSettings.cas;
    location.href = CASSettings.url + "/login?service=" + CASSettings.service;
  }

  public loginToOpenID(login: string, password: string) {
    this.authenticationOpenID(login, password);
  }

  private messageEventListener = undefined;

  private declareOpenIDGlobalAPI() {
    this.messageEventListener = (data: MessageEvent) => {
      if (!data || typeof data !== 'object' || typeof data.data !== 'string') {
        return;
      }
      if (environment.displayLog) {
        console.log("Post message raw data", data);
      }
      if (data.data.includes("|")) {
        this.processOpenIDResponse(data.data);
      }
      const osPrefix = 'osAuth:';
      if (data.data.startsWith(osPrefix)) {
        this.processOSAuthResponse(data.data.substring(osPrefix.length));
      }
    };
    window.addEventListener("message", this.messageEventListener);
  }

  private redirectOpenIDPage(event: string) {
    // debug page:
    // return `https://sdo.1c.ru/test/redirect_${event}.html`;
    return `${this.settings.ServiceURL('users')}/openid/process/${this.settings.PublicationName()}/${event}/${this.versionAPI}`;
  }

  private getOpenIDFrame(): HTMLIFrameElement {

    const frameID = "openIDFrame";
    let iframeElement = document.getElementById(frameID) as HTMLIFrameElement;

    if (iframeElement) {
      iframeElement.parentElement.removeChild(iframeElement);
    }

    iframeElement = document.createElement("iframe");
    iframeElement.setAttribute('id', frameID);
    iframeElement.setAttribute('src', "");
    iframeElement.setAttribute(
      'style', "visibility: hidden; position: absolute; left: 0; top: 0; height:0; width:0; border: none; display: none;");
    document.body.appendChild(iframeElement);

    return iframeElement;

  }

  // Автоматически ищет авторизованную OpenID сессию и входит по ней
  //
  private lookupOpenID() {

    this.onChange$.next(authStatuses.UNKNOWN);

    const frame = this.getOpenIDFrame();
    const providerURL = this.authSettings.openid.provider + "?cmd=lookup";

    frame.contentDocument.documentElement.innerHTML = `
    <html>
    <head></head>
    <body>
      <form name="lookup" id="lookup" method="post" action="${providerURL}">
        <input type="hidden" name="openid.return_to" value="${this.redirectOpenIDPage("lookup")}"/>
        <input type="hidden" name="openid.auth.check" value="true"/>
      </form>
    </body>
    </html>`;

    (frame.contentDocument.getElementById('lookup') as HTMLFormElement).submit();

  }

  private checkOpenID() {

    const frame = this.getOpenIDFrame();
    const providerURL = this.authSettings.openid.provider + "?cmd=lookup"; // значение lookup - это не ошибка.

    frame.contentDocument.documentElement.innerHTML = `
    <html>
    <head></head>
    <body>
      <form name="check" id="check" method="post" action="${providerURL}">
        <input type="hidden" name="openid.return_to" value="${this.redirectOpenIDPage("check")}"/>
        <input type="hidden" name="openid.auth.check" value="true"/>
      </form>
    </body>
    </html>`;

    (frame.contentDocument.getElementById('check') as HTMLFormElement).submit();

  }

  // Отправляет запрос на авторизацию провайдеру
  //
  private authenticationOpenID(login: string, password: string) {

    const frame = this.getOpenIDFrame();
    const providerURL = this.authSettings.openid.provider + "?cmd=auth";

    frame.contentDocument.documentElement.innerHTML = `
    <html>
    <head></head>
    <body>
      <form name="auth" id="auth" method="post" action="${providerURL}">
        <input type="hidden" name="openid.return_to" value="${this.redirectOpenIDPage("authentication")}"/>
        <input type="hidden" name="openid.auth.check" value="true"/>
        <input type="hidden" name="openid.auth.user" value="${login}"/>
        <input type="hidden" name="openid.auth.pwd" value="${password}"/>
        <input type="hidden" name="opeind.auth.short" value="false"/>
      </form>
    </body>
    </html>`;

    (frame.contentDocument.getElementById('auth') as HTMLFormElement).submit();

  }

  // Отменяет аутентификацию провайдера
  //
  private logoutOpenID() {

    const providerURL = this.authSettings.openid.provider + "?cmd=logout";

    if (environment.displayLog) {
      console.log("OpenID logout is starting");
    }

    return this.http.post(providerURL, "").subscribe(
      () => {
        if (environment.displayLog) {
          console.log("OpenID logout complete");
        }
      },
      (err) => this.err.register(err),
      () => {
        if (environment.displayLog) {
          console.log("Start reload after logout OpenID session");
        }
          location.reload();
      }
    );

  }

  private emptyMessage(): AuthMessage {
    const emptyMessage: AuthMessage = {
      isError: false,
      messageCode: null,
      messageText: "",
      data: {}
    };
    return emptyMessage;
  }

  // Вызывается из фрейма для установки сессии или показа окна авторизации
  //
  processOpenIDResponse(sessionDataString: string) {

    if (typeof sessionDataString !== "string") {
      return;
    }

    const dataArray: string[] = sessionDataString.split("|");

    if (dataArray.length !== 2) {
      return;
    }

    if (environment.displayLog) {
      console.log("OpenID raw response", sessionDataString);
    }

    const event = dataArray[1];
    const rawObject = dataArray[0];

    const responseObj = JSON.parse(rawObject);
    if (!("error" in responseObj) || !("data" in responseObj)) {
      return;
    }

    if (responseObj.error) {
      if (event === 'authentication') {
        this.processSignInError(responseObj);
      } else if (event === 'check') {
        this.SignOut();
      } else {
        this.onChange$.next(authStatuses.NOT_AUTHENTICATED);
      }
      return;
    }

    const responseData = responseObj.data as OpenIdAnyResponse;
    this.api.ConvertTerms(responseData);

    if (event === 'check') {
      const signInResponse = responseData as CheckOpenIDSessionResponse;
      if (!signInResponse.result) {
        this.SignOut();
      }
      return;
    }

    // authentication or lookup
    // logout не дает функции обратного вызова

    const signInResponse = responseData as OpenIDSessionDataResponse;
    this.clientID = signInResponse.clientID;
    this.passwordHash = "";
    this.processSignInResponse(signInResponse, false);
    return;

  }

  public SearchParams(): string {

    if (!this.session) {
      return "";
    }

    const key: string = this.hash(this.versionAPI + this.passwordHash + this.clientID + this.session);
    return `?key=${key}&session=${this.session}`;

  }

  public SignIn(login: string, password: string, pinCode: PinCode, passwordHash?: string): void {

    pinCode.code = pinCode.code.trim();
    pinCode.option = pinCode.option.trim();

    password = password.trim();

    this.passwordHash = (!!passwordHash) ? passwordHash : (!!password) ? this.hash(password) : "";

    this.clientID = uuid();

    const signInData: SignInRequest = {
      login: login.trim(),
      clientID: this.clientID,
      key: this.hash(this.versionAPI + this.passwordHash + this.clientID),
      version: this.versionAPI,
      usePinCode: this.settings.Registration().usePinCode,
      pinCode: pinCode.code,
      pinCodeOption: pinCode.option,
      userUUID: ""
    };

    if (environment.displayLog) {
      console.log("Sign in data: ", signInData);
    }

    this.api.Get<SignInResponse>(
      "session/new/standard", signInData, APIServiceNames.users, "", SignInResponse).subscribe(
        (response) => this.processSignInResponse(response, false),
        (err) => this.processSignInError(err)
      );

  }

  public SignInByUUID(userUUID: string, keyHash: string): void {

    this.clientID = uuid();

    const signInData: SignInRequest = {
      userUUID: userUUID,
      login: "",
      clientID: this.clientID,
      key: keyHash,
      version: this.versionAPI,
      usePinCode: false,
      pinCode: "",
      pinCodeOption: "",
    };

    if (environment.displayLog) {
      console.log("Sign in by user UUID data: ", signInData);
    }

    this.api.Get<SignInResponse>(
      "session/new/byUUID", signInData, APIServiceNames.users, "", SignInResponse).subscribe(
        (response) => this.processSignInResponse(response, false),
        (err) => this.processSignInError(err)
      );

  }

  public loginToOS() {

    const service: APIServiceName | string = (this.settings.Authentication().os.publicationURL) ?
      this.settings.Authentication().os.publicationURL + "/hs/users" : this.settings.ServiceURL("users");

    const frame = this.getOpenIDFrame();

    this.clientID = uuid();
    this.passwordHash = "";

    const signInData: SignInRequest = {
      login: "",
      clientID: this.clientID,
      key: this.hash(this.versionAPI + this.passwordHash + this.clientID),
      version: this.versionAPI,
      usePinCode: this.settings.Registration().usePinCode,
      pinCode: "",
      pinCodeOption: "",
      userUUID: ""
    };

    frame.src = service +  "/session/new/os?" + LocationTools.objectToSearchParams(signInData);

  }

  private processOSAuthResponse(responseText: string) {
    const response: BaseResponse = JSON.parse(responseText);
    if (response.error) {
      this.processSignInError(response);
    } else {
      this.api.ConvertTerms(response.data);
      this.processSignInResponse(response.data as SignInResponse, false);
    }
  }

  private submitResponseFromCASServer() {

    const locationObject = LocationTools.SearchToArray(location.search);

    if ('ticket' in locationObject) {

      this.clientID = locationObject.ticket;
      this.passwordHash = "";

      const signInCASData: SignInDataCASData = {
        clientID: this.clientID,
        version: this.versionAPI,
        publication: this.settings.PublicationName()
      };

      this.onChange$.next(authStatuses.UNKNOWN);

      this.api.Get<SignInResponse>(
        "session/new/cas",
        signInCASData,
        APIServiceNames.users,
        "",
        SignInResponse).subscribe(
          (response) => this.processSignInResponse(response, true),
          (err) => this.processSignInError(err)
        );

    }

  }

  private exitFromCAS() {
    const CASSettings = this.authSettings.cas;
    location.href = CASSettings.url + "/logout?service=" + CASSettings.service;
  }

  private processSignInResponse(response: SignInResponse, refresh: boolean) {

    this.onGetMessage$.next(this.emptyMessage());

    if (response.notification) {
      this.as.Open({ text: response.notification });
    }

    if (response.additionalInformation && !response.session) {
      const message: AuthMessage = {
        isError: false,
        messageCode: null,
        messageText: null,
        data: response,
      };
      this.onGetMessage$.next(message);
      return;
    }

    if (!response.session) {
      this.err.register("Empty session");
      return;
    }

    this.session = response.session;
    this.user = response.user;
    this.login = response.login;
    this.typeSession = response.typeSession;
    this.permissions = response.permissions;

    this.cookieService.set(this.settings.StorageName("session"), this.session, this.settings.CookiesExpires(), "/");
    this.cookieService.set(this.settings.StorageName("version"), this.versionAPI, this.settings.CookiesExpires(), "/");

    this.setItem("user", this.user);
    this.setItem("login", this.login);
    this.setItem("clientID", this.clientID);

    this.setItem("permissions", this.permissions);
    this.setItem("typeSession", this.typeSession);

    if ('passwordHash' in response && this.passwordHash !== response.passwordHash) {
      this.passwordHash = response.passwordHash;
      this.setItem("passwordHash", response.passwordHash);
    } else if (this.passwordHash) {
      this.setItem("passwordHash", this.passwordHash);
    } else {
      this.setItem("passwordHash", "");
    }

    if (this.messageEventListener) {
      window.removeEventListener("message", this.messageEventListener);
      this.messageEventListener = undefined;
    }

    if (refresh) {
      const url = new URL(location.href);
      url.search = "";
      location.href = url.href;
    } else {
      this.onChangeUserData$.next(this.userDescription());
      this.onChange$.next(authStatuses.AUTHENTICATED);
    }

  }

  private processSignInError(err: any) {
    if (this.api.ValidateResponse(err)) {
      const response = err as BaseResponse;
      this.err.messageByCode(response.error).subscribe(
        (messageText) => {
          if (!messageText) {
            this.err.register(err);
            return;
          }
          const message: AuthMessage = {
            isError: true,
            messageCode: response.error as AuthMessageCode,
            messageText: messageText,
            data: response.data,
          };
          this.onGetMessage$.next(message);
        },
        (err2) => this.err.register(err2)
      );
    } else {
      this.err.register(err);
    }
  }

  public onlyOpenID(): boolean {
    return this.authSettings.openid.available
      && !this.authSettings.standard.available && !this.authSettings.cas.available;
  }

  public availableSignOut(): boolean {
    if (this.onlyOpenID() && !this.authSettings.openid.cancelAuthProvider) {
      // Выход недоступен, так как при использовании только openID без выхода из провайдера
      // будет после выхода выполнен автоматический вход и выход теряет смысл.
      return false;
    }
    return true;
  }

  public SignOut(reload: boolean = true): void {

    if (this.onChange$.getValue() === authStatuses.NOT_AUTHENTICATED) {
      return;
    }

    const exitLocal = () => {

      this.cookieService.delete(this.settings.StorageName("session"), "/");
      this.cookieService.delete(this.settings.StorageName("version"), "/");

      this.deleteItem("user");
      this.deleteItem("login");
      this.deleteItem("clientID");
      this.deleteItem("passwordHash");
      this.deleteItem("permissions");
      this.deleteItem("typeSession");
      this.deleteItem("userName");
      this.deleteItem("avatar");

      // CAS:  В настоящее время не используется выход из провайдера CAS через this.exitFromCAS();

      if (this.typeSession === "openid" && this.authSettings.openid.cancelAuthProvider) {

        this.logoutOpenID();

      } else {

        if (reload) {
          if (environment.displayLog) {
            console.log("Start reload");
          }
          location.reload();
        } else {
          this.onChange$.next(authStatuses.NOT_AUTHENTICATED);
        }

      }

    };

    const requestData: CloseSessionRequest = {
      tabUUID: this.tabUUID
    };

    this.api.Get<EmptyClass>(
      "session/close",
      requestData,
      APIServiceNames.users,
      this.SearchParams(),
      EmptyClass
    ).subscribe(
      () => exitLocal(),
      err => {
        this.err.register(err);
        // Если возникла ошибка, то в любом
        // случае удаляем все данные локально, так
        // как ошибка может быть неустранимой и тогда
        // мы никогда не сможем выйти.
        exitLocal();
      },
    );

  }

  public IsPermission(permission: AuthPermissionName): boolean {
    if (!this.permissions) {
      return false;
    }
    if (!(permission in this.permissions)) {
      return true;
    }
    return this.permissions[permission];
  }

  public StartBlocks(): StartBlockName[] {
    const blocks: StartBlockName[] = [];
    blocks.push(startBlockNames.primary);
    if (this.IsPermission(authPermissionNames.education) && !this.IsPermission(authPermissionNames.teaching)) {
      blocks.push(startBlockNames.studentActivities);
    }
    if (this.IsPermission(authPermissionNames.teaching)) {
      blocks.push(startBlockNames.teacherActivities);
      blocks.push(startBlockNames.teacherTasks);
    }
    if (this.IsPermission(authPermissionNames.news)) {
      blocks.push(startBlockNames.news);
    }
    if (this.settings.AvailablePinCodesOnStartPage()) {
      blocks.push(startBlockNames.pinCodes);
    }
    return blocks;
  }

  public StartBlockIsAvailable(blockName: StartBlockName): boolean {
    return this.StartBlocks().indexOf(blockName) > -1;
  }

  public getUserDescription(): CurrentUserDescription {
    return this.userDescription();
  }

  public UpdateUseDescription(userDescription?: UserDescription, updateRndAvatarParam?: boolean): void {
    let isChanges = false;
    if (userDescription && this.userName !== userDescription.name) {
      this.userName = userDescription.name;
      this.setItem("userName", this.userName);
      isChanges = true;
    }
    if (userDescription && this.avatar !== userDescription.avatar) {
      this.avatar = userDescription.avatar;
      this.setItem("avatar", this.avatar);
      isChanges = true;
    }
    if (updateRndAvatarParam) {
      this.rndAvatarParam = (new Date()).getTime().toString();
      isChanges = true;
    }
    if (isChanges) {
      this.onChangeUserData$.next(this.userDescription());
    }
  }

  public setTabUUID(tabUUID: string) {
    this.tabUUID = tabUUID;
  }

  private hash(data: string) {
    return enc.Base64.stringify(SHA1(data));
  }

  private getItem<T extends string | {}>(name: string, isObject: boolean): T {
    const itemName: string = this.settings.StorageName(name);
    const itemValue: string = localStorage.getItem(itemName);
    if (isObject) {
      return JSON.parse(itemValue);
    } else {
      return itemValue as T;
    }
  }

  private setItem(name: string, value: string | {}): void {
    let valueToSet: string;
    if (typeof value === "string") {
      valueToSet = value;
    } else {
      valueToSet = JSON.stringify(value);
    }
    localStorage.setItem(this.settings.StorageName(name), valueToSet);
  }

  private deleteItem(name: string) {
    localStorage.removeItem(this.settings.StorageName(name));
  }

  private userDescription(): CurrentUserDescription {
    const user = new CurrentUserDescription();
    user.name = this.userName;
    user.id = this.user;
    user.avatar = this.avatar;
    user.login = this.login;
    user.rndAvatarParam = this.rndAvatarParam;
    return user;
  }

  public getLogin() {
    return this.login;
  }

}
