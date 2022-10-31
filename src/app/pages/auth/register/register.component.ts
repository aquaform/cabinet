import { Component } from '@angular/core';
import { SettingsService } from '@modules/root/settings/settings.service';
import { RegistrationSettings, RegistrationFormField, UserAgreementDocument, LogoSize } from '@modules/root/settings/settings.interface';
import { environment } from '@environments/environment';
import { ApiService } from '@modules/root/api/api.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { APIServiceNames, BaseResponse } from '@modules/root/api/api.interface';
import { takeUntil } from 'rxjs/operators';
import { AppComponentTemplate } from '@shared/component.template';
import { ObjectAPI } from '@modules/root/api/api.converter';
import { FormFieldData } from '@modules/root/forms/forms.interface';
import { AdditionalInformationElementArray } from '@modules/user/user.interface';
import { Lang, Language } from '@modules/root/i18n/i18n.class';
import { TranslateService } from '@ngx-translate/core';
import { StringsTools } from '@modules/root/strings/strings.class';

export type RegisterFormPage = "start" | "pin" | "final";

export const registerFormPages = {
  start: "start" as RegisterFormPage,
  pin: "pin" as RegisterFormPage,
  final: "final" as RegisterFormPage,
};

export interface FieldData extends FormFieldData {
  field: RegistrationFormField;
  value: string;
  confirmedField: FieldData;
}

export interface PinCodeData {
  value: string;
}

export interface RegisterFormData {
  fieldsData: FieldData[];
  submit: () => void;
  errorCode: string;
  isLoading: boolean;
  currentPage: RegisterFormPage;
  settings: RegistrationSettings;
  pinCodeData: PinCodeData;
  additionalInformation: AdditionalInformationElementArray;
  login: string;
  optionValue: string;
}



export class RegisterRequest {
  userData: {
    name: string;
    value: string | number | boolean;
  }[];
  additionalInformation: {
    "name": "pinCodeOption";
    "value": string;
  }[];
  publication: string;
}

export class RegisterResponse {
  @ObjectAPI(AdditionalInformationElementArray) additionalInformation?: AdditionalInformationElementArray;
  login?: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent extends AppComponentTemplate {

  logo: string = this.settings.Logo();
  logoSize: LogoSize = this.settings.LogoSize();
  pages = registerFormPages;

  formData: RegisterFormData = {
    fieldsData: [],
    submit: () => { this.submitData(); },
    errorCode: "",
    isLoading: false,
    currentPage: "start",
    settings: this.settings.Registration(),
    pinCodeData: {
      value: ""
    },
    additionalInformation: [],
    login: "",
    get optionValue(): string {
      if (this.additionalInformation && this.additionalInformation.length) {
        return this.additionalInformation[0].value;
      }
      return "";
    }
  };


  constructor(
    private settings: SettingsService,
    private api: ApiService,
    private err: ErrorsService,
    private translate: TranslateService,
  ) {

    super();

  }

  ngOnInit() {
    this.initFormData();
  }

  initFormData() {

    this.formData = {
      fieldsData: [],
      submit: () => { this.submitData(); },
      errorCode: "",
      isLoading: false,
      currentPage: "start",
      settings: this.settings.Registration(),
      pinCodeData: {
        value: ""
      },
      additionalInformation: [],
      login: "",
      get optionValue(): string {
        if (this.additionalInformation && this.additionalInformation.length) {
          return this.additionalInformation[0].value;
        }
        return "";
      }
    };

    for (const fieldSetting of this.formData.settings.form) {
      this.formData.fieldsData.push({
        field: fieldSetting,
        value: "",
        startValue: "",
        confirmedField: null,
        source: fieldSetting
      });
      if (fieldSetting.confirm) {
        const confirmField: FieldData = {
          field: fieldSetting,
          value: "",
          startValue: "",
          confirmedField: this.formData.fieldsData[this.formData.fieldsData.length - 1],
          source: fieldSetting
        };
        this.formData.fieldsData.push(confirmField);
      }
    }

    if (this.formData.settings?.userAgreement?.available) {

      const userAgreementSettings = this.formData.settings.userAgreement;
      const currentLang: Lang = Language.get(this.translate);
      let userAgreementTitle = userAgreementSettings.title?.[currentLang];

      if (userAgreementTitle && userAgreementSettings?.documents?.length) {
        const docToHTML = (doc: UserAgreementDocument): string => {
          return `<a href="${doc.url}" target="_blank">${doc.title}</a>`;
        }
        const docsToList: UserAgreementDocument[] = [];
        userAgreementSettings.documents
          .filter((doc) => doc.lang === currentLang)
          .forEach((doc) => {
          userAgreementTitle = StringsTools.ReplaceAll(userAgreementTitle, doc.title, docToHTML(doc));
          if (userAgreementTitle.indexOf(doc.url) === -1) {
            docsToList.push(doc);
          }
        });
        if (docsToList.length) {
          const docsLi: string = docsToList.map((doc) => {
            return `<li>${docToHTML(doc)}</li>`;
          }).join(" ");
          userAgreementTitle = `<div>${userAgreementTitle}</div><ul>${docsLi}</ul>`;
        }
      }

      if (userAgreementTitle) {
        const userAgreementField: FieldData = {
          field: {
            id: "userAgreement",
            name: userAgreementTitle,
            typeInput: "text",
            required: true,
            typeValue: "boolean",
            variants: null,
            description: "",
            confirm: false,
            confirmName: "",
            useAsLogin: false,
            labelAsHTML: true
          },
          value: "",
          startValue: "",
          confirmedField: undefined,
          source: userAgreementSettings
        };
        this.formData.fieldsData.push(userAgreementField);
      }

    }

  }

  submitData() {

    this.formData.isLoading = true;

    if (environment.displayLog) {
      console.log(this.formData);
    }

    const requestData: RegisterRequest = {
      userData: [],
      additionalInformation: [],
      publication: this.settings.PublicationName()
    };

    if (this.formData.additionalInformation && this.formData.additionalInformation.length) {
      requestData.additionalInformation.push({
        name: "pinCodeOption",
        value: this.formData.additionalInformation[0].value
      });
    }

    for (const currentField of this.formData.fieldsData) {
      if (currentField.confirmedField) {
        continue;
      }
      requestData.userData.push({
        value: currentField.value,
        name: currentField.field.id
      });
    }

    requestData.userData.push({
      value: this.settings.PublicationName(),
      name: "publication"
    });

    if (this.formData.pinCodeData.value) {
      requestData.userData.push({
        value: this.formData.pinCodeData.value,
        name: "pinCode"
      });
    }

    this.api.Get<RegisterResponse>(
      "user/new",
      requestData,
      APIServiceNames.users,
      "",
      RegisterResponse)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          if (environment.displayLog) {
            console.log(response);
          }
          if (!response) {
            return;
          }
          if ("additionalInformation" in response && response.additionalInformation.length) {
            this.formData.additionalInformation = response.additionalInformation;
          }
          if ("login" in response) {
            this.formData.login = response.login;
          }
          if (this.formData.login) {
            this.formData.currentPage = registerFormPages.final;
          }
        },
        (err) => {
          if (this.api.ValidateResponse(err)) {
            const response = err as BaseResponse;
            this.formData.errorCode = response.error;
          } else {
            this.err.register(err);
          }
          this.formData.isLoading = false;
        },
        () => this.formData.isLoading = false
      );

  }

  goToStart() {
    this.formData.currentPage = this.pages.start;
  }

}
