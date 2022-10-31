import { Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from '@environments/environment';
import { AuthService } from '@modules/auth/auth.service';
import { APIDataTypes, APIServiceNames } from '@modules/root/api/api.interface';
import { ApiService } from '@modules/root/api/api.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';
import { EduStudentActivityDescription, QualityPollFormData, SavePollRequest, SavePollResponse } from '../../student.interface';

@Component({
  selector: 'app-activity-poll',
  templateUrl: './activity-poll.component.html',
  styleUrls: ['./activity-poll.component.scss']
})
export class ActivityPollComponent extends AppComponentTemplate {

  @Input() activity: EduStudentActivityDescription;
  @Output() emitFormData = new EventEmitter<QualityPollFormData>();

  formData: QualityPollFormData = {
    comment: "",
    mark: 0,
    isSaving: false,
    user: null
  };

  displayForm = true;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
  ) {
    super();
  }

  ngOnInit() {
    this.formData.comment = (!!this.activity.commentQualityPoll) ? this.activity.commentQualityPoll : "";
    this.displayForm = (this.formData.comment) ? false : true;
    this.formData.mark = (!!this.activity.markQualityPoll) ? this.activity.markQualityPoll : 0;
    this.formData.user = this.activity.user;
    this.emitFormData.emit(this.formData);
  }

  selectStar(value: number) {
    this.formData.mark = value;
    const requestData: SavePollRequest = {
      mark: this.formData.mark
    };
    this.saveData(requestData);
    this.emitFormData.emit(this.formData);
  }

  savePollComment() {
    const requestData: SavePollRequest = {
      comment: this.formData.comment
    };
    this.setLoading(true);
    this.saveData(requestData);
    this.emitFormData.emit(this.formData);
  }

  saveData(requestData: SavePollRequest) {

    this.api.Get<SavePollResponse>(
      `edu/quality/save/${this.activity.userActivity}`,
      requestData,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      SavePollResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Save quality response:", response);
        }
        if (this.formData.comment) {
          this.displayForm = false;
        }
      },
      (err) => this.err.register(err),
      () => this.setLoading(false)
    );

  }

  setLoading(value: boolean) {
    this.formData.isSaving = value;
  }

  setDisplayForm(): false {
    this.displayForm = true;
    return false;
  }

}
