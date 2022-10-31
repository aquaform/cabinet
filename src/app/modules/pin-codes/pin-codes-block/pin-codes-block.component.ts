import { Component } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { ProfileSettingsResponse, ProfilePinCodeFormData, ProfileActivatePinCodeRequest, ProfileActivatePinCodeResponse } from '@modules/profile/profile.interface';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { environment } from '@environments/environment';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@modules/root/alert/alert.service';
import { DevicesTools } from '@modules/root/devices/devices.class';

@Component({
  selector: 'app-pin-codes-block',
  templateUrl: './pin-codes-block.component.html',
  styleUrls: ['./pin-codes-block.component.scss']
})
export class PinCodesBlockComponent extends AppComponentTemplate {

  profileData: ProfileSettingsResponse;
  pinCodeFormData: ProfilePinCodeFormData;

  modalNewPinCodeManager = new BehaviorSubject<boolean>(false);
  modalNewPinCodeBlockVisibility = false;

  isLoading = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
    private translate: TranslateService,
    private alert: AlertService,
  ) {
    super();
    this.initPinCodeFormData();
  }

  ngOnInit(): void {

    this.getServerData();

    this.modalNewPinCodeManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => this.modalNewPinCodeBlockVisibility = modalStatus,
        (err) => this.err.register(err)
      );

  }

  getServerData() {

    this.isLoading = true;
    this.pinCodeFormData.isLoading = true;

    this.api.Get<ProfileSettingsResponse>(
      `userSettings/get`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      ProfileSettingsResponse,
      APIDataTypes.json
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          if (environment.displayLog) {
            console.log("Profile data:", response);
          }
          this.profileData = response;
        },
        (err) => this.err.register(err),
        () => {
          this.pinCodeFormData.isLoading = false;
          this.isLoading = false;
        }
      );

  }

  pinCodesIsAvailable(): boolean {
    return (this.profileData
      && this.profileData.pinCodes
      && this.profileData.pinCodes.list
      && this.profileData.pinCodes.list.length) ? true : false;
  }

  displayNewPinCodeBlock(): false {
    this.modalNewPinCodeManager.next(true);
    return false;
  }

  initPinCodeFormData() {
    this.pinCodeFormData = new ProfilePinCodeFormData();
  }

  activatePinCode() {

    // Примечание: аналогичный блок есть в компоненте app-profile-settings

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
                if (!DevicesTools.isMobile()) {
                  this.alert.Open({ text: text });
                }
              },
              (err) => this.err.register(err)
            );
          }
          this.modalNewPinCodeManager.next(false);
          this.initPinCodeFormData();
          this.getServerData();
        }

      },
      (err) => this.err.register(err),
      () => this.pinCodeFormData.isLoading = false
    );

  }



}
