import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SettingsService } from '@modules/root/settings/settings.service';
import {
  EduStudentActivityDescription,
  EduStudentCompleteActivityResponse,
  spentTimeDisplayOptions,
  EduStudentActivityDescriptionResponse,
  translateStudentScorePostfix,
} from '../../student.interface';
import { ResService } from '@modules/resources/res/res.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { questionAnswers } from '@modules/root/question/question.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { environment } from '@environments/environment';
import { AlertService } from '@modules/root/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { QuestionService } from '@modules/root/question/question.service';
import {
  ActivityPluginServiceProcessRequest,
  ActivityPluginServiceProcessResponse,
  eduStatuses
} from '@modules/activities/activities.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-activity-description',
  templateUrl: './activity-description.component.html',
  styleUrls: ['./activity-description.component.scss'],
})
export class ActivityDescriptionComponent extends AppComponentTemplate {

  @Input() activity: EduStudentActivityDescription;
  @Input() displayLeft = true;
  @Input() displayRight = true;
  @Input() displayBottom = true;

  @Output() refreshData = new EventEmitter<EduStudentActivityDescriptionResponse | null>();

  Settings: SettingsService = this.settings;
  isLoading = false;
  statuses = eduStatuses;
  spentTimeDisplayOptions = spentTimeDisplayOptions;

  modalOpenedQuizResultsManager = new BehaviorSubject<boolean>(false);
  modalOpenedQuizResultsVisibility = false;

  constructor(
    private settings: SettingsService,
    private res: ResService,
    private err: ErrorsService,
    private api: ApiService,
    private auth: AuthService,
    private alert: AlertService,
    private translate: TranslateService,
    private question: QuestionService) {

    super();

  }

  ngOnInit() {

    this.modalOpenedQuizResultsManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => {
          this.modalOpenedQuizResultsVisibility = modalStatus;
        },
        (err) => this.err.register(err)
      );

  }

  displayCompleteQuestion() {
    this.translate.get('STUDENT_ACTIVITY.COMPLETE.QUESTION').subscribe(
      (text) => {
        this.question.Open({ text: text }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
          (result) => {
            if (result === questionAnswers.yes) {
              this.complete();
            }
          },
          (err) => this.err.register(err)
        );
      }
    );
  }

  complete() {

    this.isLoading = true;

    this.api.Get<EduStudentCompleteActivityResponse>(
      `edu/activity/complete/${this.activity.userActivity}`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduStudentCompleteActivityResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Student complete activity response:", response);
        }
        this.displayCompleteErrorMessage(response);
      },
      (err) => this.err.register(err),
      () => {
        this.isLoading = false;
        this.refreshData.emit(); // Данные будут обновлены в любом случае
      }
    );

  }

  displayCompleteErrorMessage(serverData: EduStudentCompleteActivityResponse) {

    const messageCode: string = (serverData.message && serverData.message.code) ? serverData.message.code : "";
    if (!messageCode) {
      return;
    }

    this.translate.get("STUDENT_ACTIVITY.COMPLETE." + messageCode, serverData).subscribe(
      (messageText) => this.alert.Open({ text: messageText }),
      (err) => this.err.register(err)
    );

  }

  start() {
    if (this.activity.isSingleElectronicResource) {
      this.openRes();
    } else {
      this.startDuration();
    }
  }

  startDuration() {

    this.isLoading = true;

    this.api.Get<EduStudentActivityDescriptionResponse>(
      `edu/activity/start/${this.activity.userActivity}`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduStudentActivityDescriptionResponse,
      APIDataTypes.xml
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Student start duration response:", response);
        }
        if (response.response.userActivity.isSingleElectronicResource) {
          this.openActivityRes(response.response.userActivity);
        }
        this.refreshData.emit(response);
      },
      (err) => {
        this.err.register(err);
        this.refreshData.emit();
      },
      () => {
        this.isLoading = false;
      }
    );

  }

  openRes() {

    this.openActivityRes(this.activity);

  }

  goToService() {

    if (this.activity.pluginService.processServiceData && this.activity.pluginService.id) {

      this.isLoading = true;

      const requestData: ActivityPluginServiceProcessRequest = {
        webAddress: this.activity.pluginService.webAddress,
        isModerator: false
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

  openActivityRes(activity: EduStudentActivityDescription) {

    this.isLoading = true;

    this.res.Open({
      electronicCourse: activity.singleTask.electronicCourse,
      electronicResource: activity.singleTask.electronicResource,
      userActivity: activity.userActivity,
      task: activity.singleTask.task,
      fragment: activity.singleTask.fragment,
      readonly: !activity.actual
    }).subscribe({
      error: (err) => {
        this.err.register(err, false, true);
        this.isLoading = false;
      },
    });
  }

  openCertificate() {
    if (!this.activity.certificate) {
      return;
    }
    window.open("certificate.html?certificate=" + this.activity.certificate, '_blank');
  }

  openQuizResults() {
    this.modalOpenedQuizResultsManager.next(true);
  }

  translateScorePostfix(score: number): Observable<string> {
    return translateStudentScorePostfix(this.translate, score);
  }

}
