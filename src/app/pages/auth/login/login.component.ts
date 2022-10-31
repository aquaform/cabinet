import { Component, Input } from '@angular/core';
import { AuthService } from '@modules/auth/auth.service';
import { AppComponentTemplate } from '@shared/component.template';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil, map } from 'rxjs/operators';
import { authStatuses, AuthMessage, authMessageCodes } from '@modules/auth/auth.interface';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { SettingsService } from '@modules/root/settings/settings.service';
import { environment } from '@environments/environment';
import { DateAPI, ObjectAPI } from '@modules/root/api/api.converter';
import { ApiService } from '@modules/root/api/api.service';
import { authIcons } from '../auth.icons';
import { PinCodeFormData } from '@modules/pin-codes/pin-codes.interface';
import { Observable, of, zip } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { I18nDataService } from '@modules/root/i18n/i18n-data.service';
import { AuthenticationFieldSettings, LogoSize, logoSizes } from '@modules/root/settings/settings.interface';
import { AdditionalInformationElementArray } from '@modules/user/user.interface';
import * as CryptoUTF8 from "crypto-js/enc-utf8.js";
import * as CryptoBase64 from "crypto-js/enc-base64.js";
import { PageName } from '@pages/pages.interface';


type LoginPage = "start" | "pin";

const loginPages = {
  start: "start" as LoginPage,
  pin: "pin" as LoginPage
};

export interface LoginFormData {
  login: string;
  password: string;
  passwordHash: string;
  userUUID: string;
}

export class ErrorDateAuthorizationData {
  @DateAPI() startDateAccess: Date;
  @DateAPI() endDateAccess: Date;
}

export class AdditionalInformationData {
  @ObjectAPI(AdditionalInformationElementArray) additionalInformation: AdditionalInformationElementArray;
}

export class LoginPinCodeFormData extends PinCodeFormData {
  additionalInformation: AdditionalInformationElementArray;
  access: ErrorDateAuthorizationData; // Сейчас не используется для вывода сообщения
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends AppComponentTemplate {

  @Input() loginFormData: LoginFormData = {
    login: "",
    password: "",
    passwordHash: "",
    userUUID: ""
  };

  @Input() displayTitle = true;
  @Input() autoFilled = false;

  autoLogin = false;
  isReady = false;
  pinCodeFormData: LoginPinCodeFormData = new LoginPinCodeFormData();
  authIcons = authIcons;
  authStatuses = authStatuses;
  logo: string = this.settings.Logo();
  logoSize: LogoSize = this.settings.LogoSize();
  logoSizes = logoSizes;
  isLoading = false;
  page: LoginPage = loginPages.start;
  pages = loginPages;
  authSettings = this.settings.Authentication();
  recoverySettings = this.settings.Restore();
  registerSettings = this.settings.Registration();
  redirectPage: PageName = "start";

  message: AuthMessage = {
    isError: false,
    messageCode: null,
    messageText: "",
    data: {}
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    private err: ErrorsService,
    private settings: SettingsService,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private i18nData: I18nDataService,
  ) {

    super();

  }

  ngOnInit() {

    if (this.autoFilled || this.loginFormData.login) {

      this.initAuthObserver();

    } else {

      this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        params => {

          if (this.loginFormData.login) {
            return;
          }

          if (params.login) {
            this.loginFormData.login = decodeURI(params.login);
            this.autoFilled = true;
            this.autoLogin = true;
          }

          if (params.password) {
            this.loginFormData.password = decodeURI(params.password);
          }

          if (params.base64) {

            const loginData: {
              login: string;
              passwordHash?: string;
              password?: string;
              redirectPage?: PageName;
            } = JSON.parse(CryptoBase64.parse(decodeURIComponent(params.base64)).toString(CryptoUTF8));

            this.loginFormData.login = (!!loginData.login) ? loginData.login : "";
            this.loginFormData.password = (!!loginData.password) ? loginData.password : "";
            this.loginFormData.passwordHash = (!!loginData.passwordHash) ? loginData.passwordHash : "";

            if (!!loginData.redirectPage) {
              this.redirectPage = loginData.redirectPage;
            }

            if (this.loginFormData.login) {
              this.autoFilled = true;
              this.autoLogin = true;
            }

          }

          if (params.userUUID) {
            this.autoFilled = true;
            this.autoLogin = true;
            this.loginFormData.userUUID = params.userUUID;
            this.loginFormData.passwordHash = params.keyHash;
          }

          this.initAuthObserver();
        },
        err => this.err.register(err)
      );
    }

  }

  initAuthObserver() {

    this.auth.OnChange$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        status => {

          if (status === this.authStatuses.AUTHENTICATED) {
            this.setIsLoading(true);
            if (this.autoLogin && this.loginFormData.login !== this.auth.getLogin()) {
              this.auth.SignOut(false);
            } else {
              this.router.navigate([this.redirectPage], { replaceUrl: true });
            }
          }
          if (status === this.authStatuses.NOT_AUTHENTICATED) {
            this.isReady = true;
            if (this.autoLogin) {
              this.setIsLoading(true);
              this.autoLogin = false;
              this.signIn();
            } else {
              this.setIsLoading(false);
            }
          }
        },
        err => this.err.register(err)
      );

    this.auth.OnGetMessage$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        message => {

          if (environment.displayLog) {
            console.log("Login message", message);
          }

          this.setIsLoading(false);

          // Показываем форму ввода пин-кода
          if (message.messageCode === authMessageCodes.errorDateAuthorization
            && this.settings.Registration().usePinCode) {
            this.clearMessage();
            this.page = this.pages.pin;
            this.pinCodeFormData.access = ApiService.getInstanceClass<ErrorDateAuthorizationData>(
              message.data as ErrorDateAuthorizationData, ErrorDateAuthorizationData);
            if (environment.displayLog) {
              console.log("Need enter pin code:", this.pinCodeFormData);
            }
          }

          // Показываем форму выбора опции пин-кода
          if (!message.messageCode && "additionalInformation" in message.data) {
            const additionalInformationData = ApiService.getInstanceClass<AdditionalInformationData>(
              message.data as AdditionalInformationData, AdditionalInformationData);
            this.pinCodeFormData.additionalInformation = additionalInformationData.additionalInformation;
            this.clearMessage();
            if (environment.displayLog) {
              console.log("Pin code additional information: ", this.pinCodeFormData);
            }
          }

          // Показываем сообщение
          this.message = message;

          if (this.pinCodeFormData.pinCodeData.value) {
            if (message.messageCode !== authMessageCodes.errorDateAuthorization) {
              // Выводим сообщение об ошибке, если это не сообщение об окончании срока действия
              this.pinCodeFormData.errorCode = message.messageCode;
            }
            if (message.messageCode === authMessageCodes.errorDateAuthorization) {
              // Выводим сообщение, что пин-код не может продлить срок
              this.pinCodeFormData.errorCode = authMessageCodes.errorDateAuthorizationNoPeriodInPinCode;
            }
          }

        },
        err => this.err.register(err)
      );

  }

  recoveryLinkInFooter(): boolean {
    if (this.authSettings.standard.available && this.authSettings.openid.available) {
      return true; // Две кнопки Войти и нет места для восстановления пароля
    }
    if (!this.authSettings.standard.available && !this.authSettings.openid.available) {
      return true; // Нет формы входа
    }
    return false;
  }

  setIsLoading(value: boolean) {
    this.isLoading = value;
    this.pinCodeFormData.isLoading = value;
  }

  clearMessage() {
    this.pinCodeFormData.errorCode = "";
    this.message = {
      isError: false,
      messageCode: null,
      messageText: "",
      data: {}
    };
  }

  signIn() {
    if (this.authSettings.standard.available) {
      this.clearMessage();
      this.setIsLoading(true);
      if (this.loginFormData.userUUID) {
        this.auth.SignInByUUID(this.loginFormData.userUUID, this.loginFormData.passwordHash);
      } else {
        this.auth.SignIn(this.loginFormData.login, this.loginFormData.password, {
          code: this.pinCodeFormData.pinCodeData.value,
          option: this.pinCodeFormData.optionValue
        }, this.loginFormData.passwordHash);
      }
    } else {
      this.signInOpenID();
    }
  }

  signInCAS() {
    this.auth.loginToCAS();
  }

  signInOpenID() {
    this.clearMessage();
    this.setIsLoading(true);
    this.auth.loginToOpenID(this.loginFormData.login, this.loginFormData.password);
  }

  signInOS() {
    this.clearMessage();
    this.setIsLoading(true);
    this.auth.loginToOS();
  }

  loginSettings(): Observable<AuthenticationFieldSettings> {

    const regName = this.settings.LoginSettings();

    const translateTerm = (term: string): Observable<string> => {
      return this.i18nData.Translate([term])
        .pipe(takeUntil(this.ngUnsubscribe))
        .pipe(map((translated) => {
          return translated[term];
        }));
    }

    const title$: Observable<string> = (regName.title) ? translateTerm(regName.title)
      : this.translate.get("LOGIN.LOGIN").pipe(takeUntil(this.ngUnsubscribe));

    const description$: Observable<string> = (regName.description) ?
      translateTerm(regName.description) : of("");

    const placeholder$: Observable<string> = (regName.placeholder) ?
      translateTerm(regName.placeholder) : of("");

    return zip(title$, description$, placeholder$)
      .pipe(takeUntil(this.ngUnsubscribe))
      .pipe(map((results) => {
        const finalSettings: AuthenticationFieldSettings = {
          title: results[0],
          description: results[1],
          placeholder: results[2]
        };
        return finalSettings;
      }));

  }


}
