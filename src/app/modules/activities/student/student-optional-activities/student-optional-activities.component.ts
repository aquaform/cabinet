import { Component } from '@angular/core';
import { StudentOptionalActivityListElement, StudentOptionalActivitiesResponse } from '../student.interface';
import { ApiService } from '@modules/root/api/api.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AppComponentTemplate } from '@shared/component.template';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { AuthService } from '@modules/auth/auth.service';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { SettingsService } from '@modules/root/settings/settings.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-student-optional-activities',
  templateUrl: './student-optional-activities.component.html',
  styleUrls: ['./student-optional-activities.component.scss']
})
export class StudentOptionalActivitiesComponent extends AppComponentTemplate {

  isLoading: boolean;
  optionalActivities: StudentOptionalActivityListElement[] = [];
  settingsService: SettingsService = this.settings;

  modalOptionalActivityManager = new BehaviorSubject<boolean>(false);
  modalOptionalActivityVisibility = false;
  modalOptionalActivity: StudentOptionalActivityListElement;

  constructor(
    private api: ApiService,
    private err: ErrorsService,
    private auth: AuthService,
    private settings: SettingsService
  ) {
    super();
  }

  ngOnInit() {

    this.getList();

    this.modalOptionalActivityManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => {
          if (!modalStatus) {
            this.modalOptionalActivity = null;
          }
          this.modalOptionalActivityVisibility = modalStatus;
        },
        (err) => this.err.register(err)
      );

  }

  getList() {

    this.isLoading = true;
    this.optionalActivities = [];

    this.api.Get<StudentOptionalActivitiesResponse>(
      `edu/activities/all/Open/0/0`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      StudentOptionalActivitiesResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Student optional activities:", response);
        }
        this.optionalActivities = response.map(val => val.object).filter(val => !val.isHidden);
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );

  }

  openActivity(activity: StudentOptionalActivityListElement) {
    this.modalOptionalActivity = activity;
    this.modalOptionalActivityManager.next(true);
  }


}
