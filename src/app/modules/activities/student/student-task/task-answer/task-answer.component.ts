import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CancelTaskAnswerResponse, EduStudentTaskAttempt, SaveTaskRequest, SaveTaskResponse } from '../../student.interface';
import { ApiService } from '@modules/root/api/api.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AuthService } from '@modules/auth/auth.service';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { UploadFileResponse } from '@modules/root/upload/upload.interface';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@modules/root/alert/alert.service';
import { SettingsService } from '@modules/root/settings/settings.service';

interface AnswerFormData {
  answer: string;
  validate(): boolean;
}

@Component({
  selector: 'app-task-answer',
  templateUrl: './task-answer.component.html',
  styleUrls: ['./task-answer.component.scss']
})
export class TaskAnswerComponent extends AppComponentTemplate implements OnChanges {

  @Input() taskData: EduStudentTaskAttempt;
  @Input() isLoading = false;

  @Output() updateData = new EventEmitter<void>();
  @Output() refreshActivityData = new EventEmitter<void>();

  answerFormData: AnswerFormData = {
      answer: "",
      validate: () => {
        if (this.answerFormData.answer) {
          return true;
        }
        if (this.taskData.userFiles && this.taskData.userFiles.length) {
          return true;
        }
        return false;
      }
  };

  timeToCancelTaskAnswer = 0;
  cancelTimer: NodeJS.Timer;
  cancelTime = 0;

  constructor(
    private api: ApiService,
    private err: ErrorsService,
    private auth: AuthService,
    private translate: TranslateService,
    private alert: AlertService,
    private settings: SettingsService
  ) {
    super();
  }

  ngOnInit() {
    this.answerFormData.answer = this.taskData.answerText;
    const activitiesSettings = this.settings.Activities();
    this.timeToCancelTaskAnswer = (activitiesSettings.timeToCancelTaskAnswer) ? activitiesSettings.timeToCancelTaskAnswer : 0;
    this.startCancelTimer();
  }

  ngOnChanges() {
    this.startCancelTimer();
  }

  submit(isDraft: boolean) {

    const requestData: SaveTaskRequest = {
      answer: this.answerFormData.answer
    };
    const path: string = (isDraft) ? `edu/task/save/${this.taskData.taskAttempt}` : `edu/task/complete/${this.taskData.taskAttempt}`;
    this.setLoading(true);
    this.api.Get<SaveTaskResponse>(
      path,
      requestData,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      SaveTaskResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Save task response:", response);
        }
        this.updateData.emit();
        this.refreshActivityData.emit();
        this.displayCompleteErrorMessage(response);
      },
      (err) => this.err.register(err),
      () => this.setLoading(false)
    );

  }

  deleteUserFileFromClientList(response: {fileID: string}) {
    this.taskData.deleteUserFile(response.fileID);
  }

  addUserFileToClientList(response: UploadFileResponse) {
    if (!response) {
      return;
    }
    for (const newFile of response) {
      this.taskData.addUserFile(newFile.ref, newFile.name, this.auth.getUserDescription().id, newFile.extension);
    }
  }

  setLoading(value: boolean) {
    this.isLoading = value;
  }

  displayCompleteErrorMessage(response: SaveTaskResponse) {

    const messageCode: string = (response.taskActionResult
      && response.taskActionResult.message
      && response.taskActionResult.message.code) ? response.taskActionResult.message.code : "";

    if (!messageCode) {
      return;
    }

    this.translate.get("STUDENT_ACTIVITY.TASKS.MESSAGES." + messageCode).subscribe(
      (messageText) => {
        this.alert.Open({ text: messageText });
      },
      (err) => this.err.register(err)
    );

  }

  allowCancel(): boolean {
    if (!this.taskData) {
      return false;
    }
    if (!this.taskData.allowCancel) {
      return false;
    }
    if (!this.timeToCancelTaskAnswer) {
      return false;
    }
    if (!this.cancelTime) {
      return false;
    }
    return true;
  }

  cancelAnswer() {

    this.stopCancelTimer();
    this.setLoading(true);

    this.api.Get<CancelTaskAnswerResponse>(
      `edu/task/cancelAnswer/${this.taskData.taskAttempt}`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      CancelTaskAnswerResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Cancel task answer response:", response);
        }
        this.updateData.emit();
        this.refreshActivityData.emit();
        this.displayCompleteErrorMessage(response);
      },
      (err) => this.err.register(err),
      () => this.setLoading(false)
    );

  }

  startCancelTimer() {
    this.stopCancelTimer();
    if (!this.taskData || !this.taskData.allowCancel) {
      return;
    }
    if (!this.timeToCancelTaskAnswer) {
      return;
    }
    const passedTime = (new Date()).getTime() - this.taskData.dateToCheckTask.getTime(); // Прошло времени с момента сдачи задания
    if (passedTime > this.timeToCancelTaskAnswer * 1000) {
      return; // Закончилось время
    }
    this.cancelTime = this.timeToCancelTaskAnswer - Math.round(passedTime / 1000); // Осталось времени на отмену
    if (this.cancelTime > this.timeToCancelTaskAnswer - 5) {
      // Если осталось времени чуть меньше, чем максимально,
      // то сбрасываем оставшееся время на максимальное.
      // Так учитываем возможный лаг на загрузку страницы.
      this.cancelTime = this.timeToCancelTaskAnswer;
    }

    this.cancelTimer = setInterval(() => {
      if (this.cancelTime === 0) {
        this.stopCancelTimer()
        return;
      }
      this.cancelTime--;
    }, 1 * 1000);
  }

  stopCancelTimer() {
    this.cancelTimer = null;
    this.cancelTime = 0;
  }

}
