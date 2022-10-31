import { Component, ViewChild, ElementRef } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AuthService } from '@modules/auth/auth.service';
import { ApiService } from '@modules/root/api/api.service';
import {
  ProfileSettingsResponse,
  ProfileSettingsFormData,
  ProfileSettingsFixedFormData,
  ProfileSettingsSaveResponse,
  ProfileSettingsSaveRequest,
  ProfileContactInformation,
  ProfileSettingsSaveContactsValue,
  ProfileAdditionalInformation,
  ProfileSettingsSaveAdditionalInfo,
  ProfileChangePasswordFormData,
  ProfileChangePasswordRequest,
  ProfileChangePasswordResponse,
  ProfilePinCodeFormData,
  ProfileActivatePinCodeRequest,
  ProfileActivatePinCodeResponse
} from '../profile.interface';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { takeUntil, concatMap, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FormFieldData } from '@modules/root/forms/forms.interface';
import { CurrentUserDescription } from '@modules/user/user.interface';
import { SettingsService } from '@modules/root/settings/settings.service';
import { AlertService } from '@modules/root/alert/alert.service';
import { UserService } from '@modules/user/user.service';
import { NotificationsService } from '@modules/root/notifications/notifications.service';
import { Language, LangDescription, Lang } from '@modules/root/i18n/i18n.class';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent extends AppComponentTemplate {

  serverData: ProfileSettingsResponse;
  formData: ProfileSettingsFormData;
  userDescription: CurrentUserDescription;
  changePasswordFormData: ProfileChangePasswordFormData;
  pinCodeFormData: ProfilePinCodeFormData;
  pathToAvatar = "";
  isLoading = false;
  isSaving = false;

  modalPhotoManager = new BehaviorSubject<boolean>(false);
  modalPhotoBlockVisibility = false;

  modalNewPinCodeManager = new BehaviorSubject<boolean>(false);
  modalNewPinCodeBlockVisibility = false;

  modalChangePasswordManager = new BehaviorSubject<boolean>(false);
  modalChangePasswordVisibility = false;

  modalContactsManager = new BehaviorSubject<boolean>(false);
  modalContactsVisibility = false;

  modalAdditionalManager = new BehaviorSubject<boolean>(false);
  modalAdditionalVisibility = false;

  modalNoticeManager = new BehaviorSubject<boolean>(false);
  modalNoticeVisibility = false;

  modalPinCodesManager = new BehaviorSubject<boolean>(false);
  modalPinCodesVisibility = false;

  modalLanguageManager = new BehaviorSubject<boolean>(false);
  modalLanguageVisibility = false;

  displayLogOut = false;

  descriptionLangs: LangDescription[] = Language.descriptionLangs();
  currentLang: Lang = Language.get(this.translate);

  @ViewChild('onlyMobileElement', { static: true }) onlyMobileElement: ElementRef;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
    private translate: TranslateService,
    private settings: SettingsService,
    private alert: AlertService,
    private user: UserService,
    private notifications: NotificationsService
  ) {
    super();
    this.displayLogOut = this.auth.availableSignOut();
  }

  ngOnInit() {

    this.getData();
    this.initChangePasswordFormData();
    this.initPinCodeFormData();

    this.auth.OnChangeUserData$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (userDescription) => {
          this.userDescription = userDescription;
          this.pathToAvatar = this.userDescription.pathToAvatar(this.settings);
        },
        (err) => this.err.register(err)
      );

    this.modalPhotoManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => this.modalPhotoBlockVisibility = modalStatus,
        (err) => this.err.register(err)
      );

    this.modalNewPinCodeManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => this.modalNewPinCodeBlockVisibility = modalStatus,
        (err) => this.err.register(err)
      );

    this.modalChangePasswordManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => this.modalChangePasswordVisibility = modalStatus,
        (err) => this.err.register(err)
      );

    this.modalContactsManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => this.modalContactsVisibility = modalStatus,
        (err) => this.err.register(err)
      );

    this.modalAdditionalManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => this.modalAdditionalVisibility = modalStatus,
        (err) => this.err.register(err)
      );

    this.modalNoticeManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => this.modalNoticeVisibility = modalStatus,
        (err) => this.err.register(err)
      );

    this.modalPinCodesManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => this.modalPinCodesVisibility = modalStatus,
        (err) => this.err.register(err)
      );

    this.modalLanguageManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => this.modalLanguageVisibility = modalStatus,
        (err) => this.err.register(err)
      );

  }

  refreshData() {
    this.getData();
    this.notifications.RefreshFromServer();
    this.modalPhotoManager.next(false);
  }

  initPinCodeFormData() {
    this.pinCodeFormData = new ProfilePinCodeFormData();
  }

  initChangePasswordFormData() {

    this.changePasswordFormData = null;

    const initChangePasswordForm = (fieldName: string, confirmFieldName: string) => {

      const passwordFormField: FormFieldData = {
        field: {
          id: "password",
          name: fieldName,
          typeInput: "password",
          required: true,
          confirm: true,
          confirmName: confirmFieldName,
          typeValue: "string",
          variants: null,
          description: ""
        },
        value: "",
        startValue: "",
        confirmedField: null,
        source: null
      };

      const confirmPasswordFormField: FormFieldData = {
        field: passwordFormField.field,
        value: "",
        startValue: "",
        confirmedField: passwordFormField,
        source: null
      };

      this.changePasswordFormData = {
        password: passwordFormField,
        passwordConfirm: confirmPasswordFormField
      };

    };

    this.translate.get(['CHANGE_PASSWORD.FIELD', 'CHANGE_PASSWORD.FIELD_CONFIRM'])
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        (translated) => initChangePasswordForm(
          translated['CHANGE_PASSWORD.FIELD'],
          translated['CHANGE_PASSWORD.FIELD_CONFIRM']),
        (err) => this.err.register(err)
      );

  }

  getData() {
    this.isLoading = true;
    this.formData = null;
    this.getServerData$().pipe(
      tap((serverData) => {
        if (environment.displayLog) {
          console.log("Profile settings data:", serverData);
        }
        this.serverData = serverData;
      }),
      concatMap((serverData) => this.getFormData$(serverData)),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(
      (response) => {
        this.formData = response;
        if (environment.displayLog) {
          console.log("Profile form data:", this.formData);
        }
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );
  }

  getServerData$(): Observable<ProfileSettingsResponse> {
    return this.api.Get<ProfileSettingsResponse>(
      `userSettings/get`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      ProfileSettingsResponse,
      APIDataTypes.json
    );
  }

  getFormData$(responseData: ProfileSettingsResponse): Observable<ProfileSettingsFormData> {

    const fixedData: ProfileSettingsFixedFormData = {
      denyMailing: null,
      denyNewMessagesMailing: null,
      denyNewForumTopicsMailing: null,
      hideContactInformation: null,
      hideAdditionalInformation: null,
    };

    const translateName = (name: string): string => {
      return `FIXED_FORM_DATA.${name}`;
    };

    const names$ = this.translate.get(Object.keys(fixedData).map((val) => translateName(val)));

    return names$.pipe(map((names) => {

      for (const key of Object.keys(fixedData)) {
        fixedData[key] = {
          field: {
            id: key,
            name: (names && translateName(key) in names) ? names[translateName(key)] : key,
            typeInput: "text",
            required: false,
            typeValue: "boolean",
            variants: null,
            description: "",
            confirm: false,
            confirmName: ""
          },
          value: responseData[key],
          startValue: responseData[key],
          confirmedField: null
        };
      }

      const formData: ProfileSettingsFormData = {
        ...fixedData,
        contacts: (responseData.contactInformation) ? responseData.contactInformation.formFieldsData : [],
        additionalInfo: (responseData.additionalInformation) ? responseData.additionalInformation.formFieldsData : [],
      };

      return formData;

    }));

  }

  submit() {

    this.isSaving = true;

    const saveData: ProfileSettingsSaveRequest = {};

    for (const key of Object.keys(this.formData)) {

      const formValue = this.formData[key];

      if (Array.isArray(formValue)) {

        // Контактная информация или дополнительная

        const changedFields: FormFieldData[] = (formValue as FormFieldData[]).filter((val) => val.startValue !== val.value);
        if (changedFields.length) {
          saveData[key] = changedFields.map((val) => {
            if (key === 'contacts') {
              const contactField = val.source as ProfileContactInformation;
              const contactToSave: ProfileSettingsSaveContactsValue = {
                num: contactField.numString,
                value: val.value,
                kind: contactField.kind,
                type: contactField.type
              };
              return contactToSave;
            }
            if (key === 'additionalInfo') {
              const additionalField = val.source as ProfileAdditionalInformation;
              const additionalToSave: ProfileSettingsSaveAdditionalInfo = {
                propertyId: additionalField.property,
                typeValue: additionalField.typeValue,
                value: val.value
              };
              return additionalToSave;
            }
          });
        }


      } else {

        // Фиксированные флажки
        if ((formValue as FormFieldData).startValue !== (formValue as FormFieldData).value) {
          saveData[key] = (formValue as FormFieldData).value;
        }

      }

    }

    if (environment.displayLog) {
      console.log("Save settings request data:", saveData);
    }

    return this.api.Get<ProfileSettingsSaveResponse>(
      `userSettings/save`,
      saveData,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      ProfileSettingsSaveResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Save settings response:", response);
        }
        if (response && response.operationComplete) {

          this.resetStartValues();

          this.translate.get("SETTINGS.SAVE_COMPLETE").subscribe(
            (message) => {
              if (this.isMobile()) {
                this.modalAdditionalManager.next(false);
                this.modalContactsManager.next(false);
                this.modalNoticeManager.next(false);
              } else {
                this.alert.Open({ text: message });
              }
            },
            (err) => this.err.register(err)
          );

        }
      },
      (err) => this.err.register(err),
      () => this.isSaving = false
    );

  }

  resetStartValues() {
    for (const key of Object.keys(this.formData)) {
      const formValue = this.formData[key];
      if (Array.isArray(formValue)) {
        for (const val of (formValue as FormFieldData[])) {
          val.startValue = val.value;
        }
      } else {
        (formValue as FormFieldData).startValue = (formValue as FormFieldData).value;
      }
    }
  }

  out() {
    this.auth.SignOut();
    return false;
  }

  displayMyCard() {
    this.user.Open(this.userDescription.id, this.userDescription.name);
    return false;
  }

  saveNewPassword() {

    this.isSaving = true;
    this.modalChangePasswordManager.next(false);

    const changePasswordData: ProfileChangePasswordRequest = {
      changePasswordData: [{
        name: "password",
        value: this.changePasswordFormData.password.value
      }]
    };

    return this.api.Get<ProfileChangePasswordResponse>(
      `user/password/change`,
      changePasswordData,
      APIServiceNames.users,
      this.auth.SearchParams(),
      ProfileChangePasswordResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Change password response:", response);
        }
        if (response && response.operationComplete) {
          this.initChangePasswordFormData();

          this.translate.get("CHANGE_PASSWORD.SUCCESS").subscribe(
            (message) => {
              if (!this.isMobile()) {
                this.alert.Open({ text: message });
              }
            },
            (err) => this.err.register(err)
          );
        }
      },
      (err) => this.err.register(err),
      () => this.isSaving = false
    );

  }

  activatePinCode() {

    this.pinCodeFormData.isLoading = true;

    const activatePinCodeData: ProfileActivatePinCodeRequest = {
      pinCode: this.pinCodeFormData.pinCodeData.value
    };

    if (this.pinCodeFormData.additionalInformation.length) {
      activatePinCodeData.pinCodeOption = this.pinCodeFormData.additionalInformation[0].value;
    }

    return this.api.Get<ProfileActivatePinCodeResponse>(
      `userSettings/pinCodes/activate`,
      activatePinCodeData,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      ProfileActivatePinCodeResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {

        if (environment.displayLog) {
          console.log("Activate pin code response:", response);
        }

        this.pinCodeFormData.errorCode = response.codeError;

        if (response.requiredOption) {
          this.pinCodeFormData.additionalInformation = [response.availableOptions];
        } else {
          this.pinCodeFormData.additionalInformation = [];
        }

        if (!this.pinCodeFormData.errorCode && response.availableForActivate) {
          if (response.notification) {
            this.alert.Open({ text: response.notification });
          } else {
            this.translate.get("PIN_CODES.SUCCESS").subscribe(
              (text) => {
                if (!this.isMobile()) {
                  this.alert.Open({ text: text });
                }
              },
              (err) => this.err.register(err)
            );
          }
          this.modalNewPinCodeManager.next(false);
          this.initPinCodeFormData();
          this.getData();
        }

      },
      (err) => this.err.register(err),
      () => this.pinCodeFormData.isLoading = false
    );

  }

  changePassword() {
    this.modalChangePasswordManager.next(true);
    return false;
  }

  displayNewPinCodeBlock() {
    this.modalNewPinCodeManager.next(true);
    return false;
  }

  displayModalPhotoBlock() {
    if (this.disableProfilePhoto()) {
      return;
    }
    this.modalPhotoManager.next(true);
    return false;
  }

  displayContactsBlock() {
    this.modalContactsManager.next(true);
    return false;
  }

  displayAdditionalBlock() {
    this.modalAdditionalManager.next(true);
    return false;
  }

  displayNoticeBlock() {
    if (this.disableNoticeBlock()) {
      return;
    }
    this.modalNoticeManager.next(true);
    return false;
  }

  displayPinCodesBlock() {
    this.modalPinCodesManager.next(true);
    return false;
  }

  displayChangeLanguageBlock(): boolean {
    return this.settings.AllowChangeUserLanguage();
  }

  displayLanguageBlock(): false {
    this.modalLanguageManager.next(true);
    return false;
  }

  saveUserLanguage(): void {
    this.settings.SaveUserLanguage(this.currentLang);
    this.isSaving = true;
    setTimeout(() => {
      location.reload();
    }, 1500)
  }

  isMobile(): boolean {
    if (!this.onlyMobileElement) {
      return false;
    }
    return !(this.onlyMobileElement.nativeElement.offsetParent === null);
    // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  }

  disableProfilePhoto(): boolean {
    const userSettings = this.settings.Users();
    if ('disableProfilePhoto' in userSettings) {
      return userSettings.disableProfilePhoto;
    }
    return false;
  }

  disableAdditionalBlock(): boolean {
    const userSettings = this.settings.Users();
    if ('disableProfileAdditional' in userSettings) {
      return userSettings.disableProfileAdditional;
    }
    return false;
  }

  disableContactBlock(): boolean {
    const userSettings = this.settings.Users();
    if ('disableProfileContacts' in userSettings) {
      return userSettings.disableProfileContacts;
    }
    return false;
  }

  disableNoticeBlock(): boolean {
    const userSettings = this.settings.Users();
    if ('disableProfileNotice' in userSettings) {
      return userSettings.disableProfileNotice;
    }
    return false;
  }

}
