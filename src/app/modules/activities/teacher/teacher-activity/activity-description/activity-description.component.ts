import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EduTeacherActivityDescription, EduTeacherChangeConductResponse } from '../../teacher.interface';
import { MessagesService } from '@modules/messages/messages.service';
import { AppComponentTemplate } from '@shared/component.template';
import { SettingsService } from '@modules/root/settings/settings.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { ApiService } from '@modules/root/api/api.service';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { AuthService } from '@modules/auth/auth.service';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ReplaySubject } from 'rxjs';
import { ActivityPluginServiceProcessRequest, ActivityPluginServiceProcessResponse, statusesTeacherActivity, statusTeacherActivityToColor } from '@modules/activities/activities.interface';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@modules/root/alert/alert.service';

@Component({
  selector: 'app-activity-description',
  templateUrl: './activity-description.component.html',
  styleUrls: ['./activity-description.component.scss']
})
export class ActivityDescriptionComponent extends AppComponentTemplate {

  @Input() activity: EduTeacherActivityDescription;
  @Input() displayLeft = true;
  @Input() displayRight = true;
  @Input() displayBottom = true;

  @Output() refreshData = new EventEmitter<void>();

  Settings: SettingsService = this.settings;
  isLoading = false;
  statusesTeacherActivity = statusesTeacherActivity;
  statusTeacherActivityToColor = statusTeacherActivityToColor;

  modalOpenedCheckListManager = new ReplaySubject<boolean>();
  modalOpenedCheckListVisibility = false;

  constructor(
    private messages: MessagesService,
    private settings: SettingsService,
    private err: ErrorsService,
    private api: ApiService,
    private auth: AuthService,
    private translate: TranslateService,
    private alert: AlertService,
  ) {
    super();
  }

  ngOnInit() {

    this.modalOpenedCheckListManager
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(
      (modalStatus) => {
        this.modalOpenedCheckListVisibility = modalStatus;
        if (!modalStatus) {
          this.refreshData.emit();
        }
      },
      (err) => this.err.register(err)
    );

  }

  sendMessageToAll() {
    this.messages.DisplayNewMessageForm(null, this.activity);
  }

  changeConducted() {

    this.isLoading = true;

    const val: string = String(!this.activity.conducted);

    this.api.Get<EduTeacherChangeConductResponse>(
      `edu/checkList/end/${val}/${this.activity.teacherActivity}`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduTeacherChangeConductResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Change conducted:", response);
        }
        if (response.operationComplete) {
          this.refreshData.emit(); // Данные будут обновлены в любом случае
          return;
        }
        this.displayCompleteErrorMessage(response);
      },
      (err) => this.err.register(err),
      () => {
        this.isLoading = false;
      }
    );

  }

  displayCompleteErrorMessage(serverData: EduTeacherChangeConductResponse) {

    const messageCode: string = serverData?.message?.code;
    if (!messageCode) {
      return;
    }

    this.translate.get("TEACHER_ACTIVITY.MESSAGES." + messageCode, serverData).subscribe(
      (messageText) => this.alert.Open({ text: messageText }),
      (err) => this.err.register(err)
    );

  }

  openCheckList() {
    this.modalOpenedCheckListManager.next(true);
  }

  goToService() {

    if (this.activity.pluginService.processServiceData && this.activity.pluginService.id) {

      this.isLoading = true;

      const requestData: ActivityPluginServiceProcessRequest = {
        webAddress: this.activity.pluginService.webAddress,
        isModerator: true
      };

      this.api.Get<ActivityPluginServiceProcessResponse>(
        `pluginService/processData/${this.activity.pluginService.id}`,
        requestData,
        APIServiceNames.edu,
        this.auth.SearchParams(),
        ActivityPluginServiceProcessResponse,
        APIDataTypes.json
      ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        (response) => {
          if (environment.displayLog) {
            console.log("Go to service response:", response);
          }
          if (response.success) {
            if ('webAddress' in response && response.webAddress) {
              location.href = response.webAddress;
            } else {
              location.href = this.activity.pluginService.webAddress;
            }
          } else {
            const errorDescription = {
              error: response.codeError,
              message: response.textError,
              parameters: response.parameters,
              title: "",
            };
            this.err.register(errorDescription);
          }

        },
        (err) => {
          this.err.register(err);
        },
        () => {
          this.isLoading = false;
        }
      );

    } else {
      location.href = this.activity.pluginService.webAddress;
    }


  }

}
