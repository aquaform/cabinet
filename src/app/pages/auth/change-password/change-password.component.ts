import { Component } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { SettingsService } from '@modules/root/settings/settings.service';
import { ApiService } from '@modules/root/api/api.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { APIServiceNames, BaseResponse } from '@modules/root/api/api.interface';
import { authIcons } from '../auth.icons';

interface ChangePasswordFormData {
  login: string;
  code: string;
  password: string;
  passwordControl: string;
  passwordHash: string;
  userUUID: string;
}

export class ChangePasswordGetFormDataRequest {
  id: string;
}

export class ChangePasswordGetFormDataResponse {
  login: string;
}

interface RecoveryMessage {
  messageCode: string;
}

interface ChangePasswordRequest {
  changePasswordData: {
    name: "password" | "id" | "code";
    value: string;
  }[];
}

export class ChangePasswordResponse {
  login: string;
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent extends AppComponentTemplate {

  recoveryID: string;
  isLoading = false;
  isSuccess = false;
  authIcons = authIcons;

  formData: ChangePasswordFormData = {
    login: null,
    code: null,
    password: null,
    passwordControl: null,
    passwordHash: null,
    userUUID: null
  };

  message: RecoveryMessage = {
    messageCode: "",
  };

  logo: string = this.settings.Logo();

  constructor(
    private settings: SettingsService,
    private api: ApiService,
    private err: ErrorsService,
    private activatedRoute: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.recoveryID = params.id;
      this.formData.code = (params.code && params.code.length > 1) ? params.code : "";
      this.getFormData();
    });
  }

  getFormData() {

    this.isLoading = true;

    const getFormRequestDate: ChangePasswordGetFormDataRequest = {
      id: this.recoveryID
    };

    this.api.Get<ChangePasswordGetFormDataResponse>(
      "user/password/restore/2",
      getFormRequestDate,
      APIServiceNames.users,
      "",
      ChangePasswordGetFormDataResponse)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
         this.formData.login = response.login;
        },
        (err) => this.err.register(err),
        () => this.isLoading = false
      );

  }

  changePassword() {

    if (this.formData.password !== this.formData.passwordControl) {
      this.message.messageCode = "passwordErrorControl";
      return;
    }

    this.isLoading = true;
    this.message.messageCode = "";

    const changePasswordRequestDate: ChangePasswordRequest = {
      changePasswordData: [
        {
          name: "code",
          value: this.formData.code
        },
        {
          name: "password",
          value: this.formData.password
        },
        {
          name: "id",
          value: this.recoveryID
        },
      ]
    };

    this.api.Get<ChangePasswordResponse>(
      "user/password/restore/3",
      changePasswordRequestDate,
      APIServiceNames.users,
      "",
      ChangePasswordResponse)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          this.isSuccess = true;
        },
        (err) => {
          if (this.api.ValidateResponse(err)) {
            const response = err as BaseResponse;
            this.message.messageCode = response.error;
          } else {
            this.err.register(err);
          }
          this.isLoading = false;
        },
        () => this.isLoading = false
      );


  }

}
