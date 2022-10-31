import { Component, Output, EventEmitter, Input, ViewChild, ElementRef, HostListener, } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { ApiService } from '@modules/root/api/api.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AuthService } from '@modules/auth/auth.service';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { EduStudentTaskAttempt, GetEduStudentTaskAttemptRequest, EduStudentActivityDescription, EduStudentActivityDescriptionResponse } from '../student.interface';
import { takeUntil, map } from 'rxjs/operators';
import { eduActivityTypes, StudentTaskPageBlockName, studentTaskPageBlockNames } from '@modules/activities/activities.interface';
import { environment } from '@environments/environment';
import { Observable, zip, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

interface PageDescription {
  name: () => Observable<string>;
  block: StudentTaskPageBlockName;
  available: boolean;
}

@Component({
  selector: 'app-student-task',
  templateUrl: './student-task.component.html',
  styleUrls: ['./student-task.component.scss']
})
export class StudentTaskComponent extends AppComponentTemplate {

  @Input() activity: string;
  @Input() task: string;
  @Input() activityDescription: EduStudentActivityDescription; // Если не задано, то будет получено с сервера

  isLoading = false;

  @Output() getActivityTitle = new EventEmitter<string>();
  @Output() getTaskTitle = new EventEmitter<string>();
  @Output() refreshData = new EventEmitter<void>();

  taskData: EduStudentTaskAttempt;

  @ViewChild('onlyMobileElement', { static: true }) onlyMobileElement: ElementRef;
  blockNames = studentTaskPageBlockNames;
  allPages: PageDescription[] = [];
  availablePages: PageDescription[] = [];
  currentBlock: StudentTaskPageBlockName;

  @HostListener('window:resize', ['$event'])
  onWindowResize($event) {
    // Позволяет перезагрузить компонент при изменении размера окна
  }

  constructor(
    private api: ApiService,
    private err: ErrorsService,
    private auth: AuthService,
    private translate: TranslateService,
  ) {
    super();
  }

  ngOnInit() {
    this.getData(true);
  }

  refreshActivityData() {
    this.refreshData.emit();
  }

  updateData() {
    this.getData(false);
  }

  private getData(firstLoad: boolean) {

    if (firstLoad) {
      this.isLoading = true;
    }

    const requestData: GetEduStudentTaskAttemptRequest = {
      firstLoad: firstLoad,
      typeActivity: eduActivityTypes.education
    };

    const taskData$: Observable<EduStudentTaskAttempt> = this.api.Get<EduStudentTaskAttempt>(
      `edu/task/get/${this.activity}/${this.task}`,
      requestData,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduStudentTaskAttempt,
      APIDataTypes.json
    );

    const activityData$: Observable<EduStudentActivityDescription> = (this.activityDescription)
      ? of(this.activityDescription)
      : this.api.Get<EduStudentActivityDescriptionResponse>(
        `edu/activity/get/${eduActivityTypes.education}/${this.activity}`,
        {},
        APIServiceNames.edu,
        this.auth.SearchParams(),
        EduStudentActivityDescriptionResponse,
        APIDataTypes.xml
      ).pipe(map((response) => {
        return response.response.userActivity;
      }));

    zip(activityData$, taskData$).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Task activity:", response);
        }
        this.activityDescription = response[0];
        this.taskData = response[1];
        this.taskData.activityIsActual = this.activityDescription.actual;
        if (firstLoad) {
          this.getActivityTitle.emit(this.taskData.eduTemplateName);
          this.getTaskTitle.emit(this.taskData.name);
        }
        this.getPages();
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );

  }

  onChangeTaskStatus() {
    this.getPages();
    this.changePage(this.allPages.find(val => val.block === this.blockNames.mark));
  }

  getPages() {
    this.allPages = [
      {
        name: () => this.translate.get('STUDENT_ACTIVITY.TASKS.task'),
        block: this.blockNames.description,
        available: true
      },
      {
        name: () => this.translate.get('STUDENT_ACTIVITY.TASKS.answer'),
        block: this.blockNames.answer,
        available: true
      },
      {
        name: () => this.translate.get('STUDENT_ACTIVITY.TASKS.mark'),
        block: this.blockNames.mark,
        available: (() => {
          if (!this.taskData) {
            return false;
          }
          if (!this.taskData.displayTeacherArea) {
            return false;
          }
          if (this.isMobile()) {
            return false; // Блок оценки виден всегда на компьютере
          }
          return true;
        })()
      }
    ];

    this.availablePages = this.allPages.filter(val => val.available);

    if (!this.currentBlock && this.availablePages.length) {
      this.currentBlock = this.availablePages[0].block;
    }

  }

  isMobile(): boolean {
    if (!this.onlyMobileElement) {
      return false;
    }
    return !(this.onlyMobileElement.nativeElement.offsetParent === null);
    // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  }

  isBlockAvailable(blockName: StudentTaskPageBlockName): boolean {
    if (this.isMobile() && this.availablePages.findIndex(val => val.block === blockName) > -1) {
      return blockName === this.currentBlock;
    } else {
      return this.allPages.find(val => val.block === blockName).available;
    }
  }

  changePage(page: PageDescription): false {
    this.currentBlock = page.block;
    return false;
  }

}
