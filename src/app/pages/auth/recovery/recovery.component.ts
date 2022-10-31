import { Component, OnInit } from '@angular/core';
import { SettingsService } from '@modules/root/settings/settings.service';
import { ApiService } from '@modules/root/api/api.service';
import { APIServiceNames, BaseResponse } from '@modules/root/api/api.interface';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { Router } from '@angular/router';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';

interface RecoveryFormData {
  login: string;
  email: string;
}

interface RecoveryMessage {
  messageCode: string;
}

interface RecoveryRequest {
  userData: {
    name: "mail" | "login";
    value: string;
  }[];
}

export class RecoveryResponse {
  id: string;
}

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.component.html',
  styleUrls: ['./recovery.component.scss']
})
export class RecoveryComponent extends AppComponentTemplate {

  recoveryFormData: RecoveryFormData = {
    login: "",
    email: "",
  };

  logo: string = this.settings.Logo();
  isLoading = false;
  message: RecoveryMessage = {
    messageCode: "",
  };

  constructor(
    private settings: SettingsService,
    private api: ApiService,
    private err: ErrorsService,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
  }

  recovery() {

    this.isLoading = true;
    this.message.messageCode = "";

    const recoveryRequestDate: RecoveryRequest = {
      userData: [
        {
          name: "login",
          value: this.recoveryFormData.login
        },
        {
          name: "mail",
          value: this.recoveryFormData.email
        }
      ]
    };

    this.api.Get<RecoveryResponse>(
      "user/password/restore/1",
      recoveryRequestDate,
      APIServiceNames.users,
      "",
      RecoveryResponse)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          this.router.navigate(['/auth', 'changePassword', response.id, '0']);
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
