import { Component, Input } from '@angular/core';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { ApiService } from '@modules/root/api/api.service';
import { AppComponentTemplate } from '@shared/component.template';
import {
  EduTeacherActivityDescription,
  EduTeacherActivityCheckListResponse,
  EduTeacherSaveCheckListData,
  EduTeacherActivityCheckListFilesResponse,
  EduTeacherUserFile,
  translateTeacherScorePostfix
} from '../../teacher.interface';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { environment } from '@environments/environment';
import { takeUntil } from 'rxjs/operators';
import {
  EduStudentActivityDescription,
  EduStudentTaskDescription,
  spentTimeDisplayOptions,
} from '@modules/activities/student/student.interface';
import { SettingsService } from '@modules/root/settings/settings.service';
import { StringsTools } from '@modules/root/strings/strings.class';
import { BehaviorSubject, of, zip, Observable, ReplaySubject } from 'rxjs';
import { eduStatuses, EduActivityStatusToNumber } from '@modules/activities/activities.interface';
import { ResService } from '@modules/resources/res/res.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-activity-check-list',
  templateUrl: './activity-check-list.component.html',
  styleUrls: ['./activity-check-list.component.scss']
})
export class ActivityCheckListComponent extends AppComponentTemplate {

  @Input() activity: EduTeacherActivityDescription;
  @Input() readonly = true;
  @Input() modalManager: BehaviorSubject<boolean> | ReplaySubject<boolean>;

  spentTimeDisplayOptions = spentTimeDisplayOptions;
  isLoading = false;
  Settings: SettingsService;
  statuses = eduStatuses;

  studentActivities: EduStudentActivityDescription[] = [];
  studentFiles: EduTeacherActivityCheckListFilesResponse = [];
  rows: {
    studentActivity: EduStudentActivityDescription,
    files: EduTeacherUserFile[]
  }[];

  openedTaskAttempt: EduStudentTaskDescription;
  openedTaskStudentActivity: EduStudentActivityDescription;
  modalOpenedTaskAttemptManager = new BehaviorSubject<boolean>(false);
  modalOpenedTaskAttemptVisibility = false;

  isLoadingGlobal = false;
  isTasks = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
    private settings: SettingsService,
    private res: ResService,
    private translate: TranslateService,
  ) {
    super();
    this.Settings = this.settings;
  }

  ngOnInit() {

    this.getData(false, !this.readonly);

    this.modalOpenedTaskAttemptManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => {
          if (!modalStatus) {
            if (this.openedTaskAttempt) {
              this.getData(true, !this.readonly);
            }
            this.openedTaskAttempt = null;
            this.openedTaskStudentActivity = null;
          }
          this.modalOpenedTaskAttemptVisibility = modalStatus;
        },
        (err) => this.err.register(err)
      );

  }

  private getData(update: boolean, getFiles: boolean) {

    this.isLoading = true;

    const activities$ = this.api.Get<EduTeacherActivityCheckListResponse>(
      `edu/checkList/get/${this.activity.providingEducation}/${this.activity.eduTemplate.type}/${this.activity.eduTemplate.id}`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduTeacherActivityCheckListResponse,
      APIDataTypes.xml
    );

    const files$: Observable<EduTeacherActivityCheckListFilesResponse>
      = (getFiles) ? this.api.Get<EduTeacherActivityCheckListFilesResponse>(
        `edu/usersFiles/get/${this.activity.providingEducation}`,
        {},
        APIServiceNames.edu,
        this.auth.SearchParams(),
        EduTeacherActivityCheckListFilesResponse,
        APIDataTypes.json
      ) : of([]);

    zip(activities$, files$).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Student files:", response);
        }
        this.studentFiles = response[1];
        this.fillCheckList(response[0], update);
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );

  }

  private fillCheckList(response: EduTeacherActivityCheckListResponse, update: boolean) {

    if (environment.displayLog) {
      console.log("Teacher check list:", response);
    }

    if (!update) {
      this.studentActivities = [];
    }

    if (response && response.response && response.response.userActivity) {
      if (response.response && response.response.userActivity) {
        for (const studentActivity of response.response.userActivity) {
          if (update) {
            const currentIndex = this.studentActivities.findIndex(val => val.userActivity === studentActivity.userActivity);
            if (currentIndex > -1) {
              const currentDetailsStatus = this.studentActivities[currentIndex].detailsStatus;
              this.studentActivities[currentIndex] = studentActivity;
              this.studentActivities[currentIndex].changeUserDetailsStatus(currentDetailsStatus);
            } else {
              this.studentActivities.push(studentActivity);
            }
          } else {
            this.studentActivities.push(studentActivity);
          }
        }
      }
    }

    this.isTasks = this.studentActivities.findIndex(val => val.tasksForTeacherArray.length) > -1;

    StringsTools.SortArrayByString<EduStudentActivityDescription>(
      this.studentActivities, (val) => val.user.name);

    this.rows = this.studentActivities.map(val => {
      return {
        studentActivity: val,
        files: this.userFiles(val.userActivity)
      };
    });

  }

  userFiles(activity: string): EduTeacherUserFile[] {
    return this.studentFiles.filter(val => val.object.userActivity === activity).map(val => val.object.file);
  }

  openTask(taskAttempt: EduStudentTaskDescription, studentActivity: EduStudentActivityDescription) {

    // Такой же код есть в списке заданий на проверку

    if (environment.displayLog) {
      console.log("Task is opening:", [studentActivity, taskAttempt]);
    }

    if (taskAttempt.disabledByTeacher) {
      return;
    }

    if (taskAttempt.isElectronicResource) {

      this.isLoadingGlobal = true;
      this.res.Open({
        electronicResource: taskAttempt.electronicResource,
        userActivity: studentActivity.userActivity,
        task: taskAttempt.task,
        user: studentActivity.user.id,
        readonly: false
      }).subscribe({
        error: (err) => {
          this.err.register(err, false, true);
          this.isLoadingGlobal = false;
        },
      });

    } else {

      this.openedTaskAttempt = taskAttempt;
      this.openedTaskStudentActivity = studentActivity;
      this.modalOpenedTaskAttemptManager.next(true);

    }

  }

  closeTask() {
    this.modalOpenedTaskAttemptManager.next(false);
  }

  changeActivityDetailsVisibility(studentActivity: EduStudentActivityDescription) {
    if (!this.isTasks) {
      return;
    }
    studentActivity.changeUserDetailsStatus();
  }

  setAllActivitiesDetails(value: boolean) {
    for (const studentActivity of this.studentActivities) {
      studentActivity.changeUserDetailsStatus(value);
    }
    return false;
  }

  // Определяет есть ли обучения у которых открыт список заданий
  //
  defaultValueToSetAllActivitiesDetails(): boolean {
    const isOpened = !!this.studentActivities.find((val) => val.detailsStatus === true);
    return (isOpened) ? false : true;
  }

  selectMark(mark: string | number, activity: EduStudentActivityDescription) {
    activity.markInCheckList = mark;
  }

  isModifiedInCheckList(): boolean {
    if (!this.studentActivities) {
      return false;
    }
    return this.studentActivities.findIndex(val => val.isModifiedInCheckList) > -1;
  }

  saveCheckList() {

    this.isLoading = true;

    const dataForSave = [];

    for (const currentActivity of this.studentActivities) {
      if (!currentActivity.isModifiedInCheckList) {
        continue;
      }
      const currentDataForSave: EduTeacherSaveCheckListData = {
        id: currentActivity.userActivity,
        mark: (this.activity.availableFillMark && currentActivity.mark) ? currentActivity.mark.id : "",
        status: (this.activity.availableFillStatus) ? EduActivityStatusToNumber(currentActivity.statusActivity) : 0,
        task: (currentActivity.singleTask) ? currentActivity.singleTask.task : "",
        comment: (currentActivity.commentToUserFromTeacher) ? currentActivity.commentToUserFromTeacher : ""
      };
      dataForSave.push(currentDataForSave);
    }

    if (environment.displayLog) {
      console.log("Check list data for save:", dataForSave);
    }

    if (!dataForSave.length) {
      this.isLoading = false;
      return;
    }

    this.api.Get<EduTeacherActivityCheckListResponse>(
      `edu/checkList/save/${this.activity.providingEducation}/${this.activity.eduTemplate.type}/${this.activity.eduTemplate.id}`,
      dataForSave,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduTeacherActivityCheckListResponse,
      APIDataTypes.xml
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (this.modalManager) {
          this.modalManager.next(false);
        }
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );

  }

  currentDate(): Date {
    return new Date();
  }

  translateScorePostfix(score: number): Observable<string> {
    return translateTeacherScorePostfix(this.translate, score);
  }

}
