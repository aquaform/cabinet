import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '@modules/root/api/api.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AuthService } from '@modules/auth/auth.service';
import { AppComponentTemplate } from '@shared/component.template';
import { EduStudentTaskAttempt } from '@modules/activities/student/student.interface';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { EduTeacherSaveMarkData, EduTeacherSaveMarkRequest, EduTeacherSaveMarkResponse } from '../../teacher.interface';
import { UploadFileResponse } from '@modules/root/upload/upload.interface';
import { EduReasonToRevision } from '@modules/activities/activities.interface';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@modules/root/alert/alert.service';

type markValue = string | number;

interface FormData {
  comment: string;
  mark: markValue;
  reasonToRevision: string;
}

@Component({
  selector: 'app-task-mark',
  templateUrl: './task-mark.component.html',
  styleUrls: ['./task-mark.component.scss']
})
export class TaskMarkComponent extends AppComponentTemplate {

  _taskData: EduStudentTaskAttempt;

  @Input() get taskData(): EduStudentTaskAttempt {
    return this._taskData;
  }
  set taskData(val: EduStudentTaskAttempt) {
    this._taskData = val;
    this.init();
  }
  @Output() updateData = new EventEmitter<void>();
  @Output() updatePages = new EventEmitter<void>();

  isSaving = false;

  markFormData: FormData;

  constructor(
    private api: ApiService,
    private err: ErrorsService,
    private auth: AuthService,
    private translate: TranslateService,
    private alert: AlertService,
  ) {
    super();
  }

  ngOnInit() {
    this.init();
  }

  init() {
    this.markFormData = {
      comment: (this.taskData) ? this.taskData.teacherComment : "",
      mark: (this.taskData) ? this.taskData.scaleMarks.getValue(this.taskData.mark) : "",
      reasonToRevision: ""
    };
  }

  retryVerify() {
    this.taskData.retryVerify();
    this.updatePages.emit();
    return false;
  }

  setSaving(value: boolean) {
    this.isSaving = value;
  }

  saveMark() {

    this.setSaving(true);

    const requestTaskData: EduTeacherSaveMarkData = {
      task: this.taskData.task,
      mark: this.taskData.scaleMarks.idByValue(this.markFormData.mark),
      reasonToRevision: this.markFormData.reasonToRevision,
      comment: this.markFormData.comment,
    };

    const requestData: EduTeacherSaveMarkRequest = [requestTaskData];

    this.api.Get<EduTeacherSaveMarkResponse>(
      `edu/tasks/save/${this.taskData.userActivity}`,
      requestData,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduTeacherSaveMarkResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Save teacher mark response:", response);
        }
        if (response && response.result && response.result.length === 1) {

          const messageCode: string = (response
            && response.result
            && response.result.length === 1
            && response.result[0].taskActionResult
            && response.result[0].taskActionResult.message) ? response.result[0].taskActionResult.message.code : "";

          if (messageCode) {
            this.translate.get("ERRORS." + messageCode).subscribe(
              (messageText) => {
                this.alert.Open({ text: messageText });
              },
              (err) => this.err.register(err)
            );
          }

        }
        this.updateData.emit();
      },
      (err) => this.err.register(err),
      () => this.setSaving(true)
    );

  }

  deleteUserFileFromClientList(response: { fileID: string }) {
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

  selectMark(mark: markValue) {
    this.markFormData.mark = mark;
    this.saveMark();
  }

  sendToRevision(reasonToRevision?: EduReasonToRevision) {
    this.markFormData.mark = "";
    if (reasonToRevision) {
      this.markFormData.reasonToRevision = reasonToRevision.id;
    }
    this.saveMark();
  }

  doControl() {
    this.markFormData.mark = this.taskData.scaleMarks.getValue(this.taskData.scaleMarks.getMax());
    this.saveMark();
  }


}
