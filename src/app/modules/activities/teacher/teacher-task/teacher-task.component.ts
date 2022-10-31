import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import {
  eduActivityTypes,
  TeacherTaskPageBlockName,
  teacherTaskPageBlockNames
} from '@modules/activities/activities.interface';
import {
  EduStudentTaskAttempt,
  GetEduStudentTaskAttemptRequest
} from '@modules/activities/student/student.interface';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ResLinkParams } from '@modules/resources/res/res.interface';
import { ResService } from '@modules/resources/res/res.service';

interface PageDescription {
  name: () => Observable<string>;
  block: TeacherTaskPageBlockName;
  available: boolean;
}

@Component({
  selector: 'app-teacher-task',
  templateUrl: './teacher-task.component.html',
  styleUrls: ['./teacher-task.component.scss']
})
export class TeacherTaskComponent extends AppComponentTemplate {

  // Блок, если нужно загрузить данные задания с сервера
  @Input() activity: string;
  @Input() task: string;

  _taskData: EduStudentTaskAttempt;
  _resLink: ResLinkParams;

  // Блок, если данные задания уже получены

  @Input() set resLink(resLink: ResLinkParams) {
    this._resLink = resLink;
    this.getPages();
  }

  get resLink(): ResLinkParams {
    return this._resLink;
  }

  @Input() set taskData(taskData: EduStudentTaskAttempt) {

    const setTaskData = () => {
      if (taskData) {
        this._taskData = taskData;
        this.activity = taskData.userActivity;
        this.task = taskData.task;
      }
      this.getPages();
    }

    if (this.wasInit) {
      this._taskData = undefined;
      this.activity = "";
      this.task = "";
      setTimeout(setTaskData, 100);
    } else {
      setTaskData();
    }

  }

  get taskData(): EduStudentTaskAttempt {
    return this._taskData;
  }

  @Output() updateTaskAttempt = new EventEmitter<EduStudentTaskAttempt>();

  isLoading: boolean;
  isLoadingGlobal = false;
  wasInit = false;

  @ViewChild('onlyMobileElement', { static: true }) onlyMobileElement: ElementRef;
  blockNames = teacherTaskPageBlockNames;
  allPages: PageDescription[] = [];
  availablePages: PageDescription[] = [];
  currentBlock: TeacherTaskPageBlockName;

  @HostListener('window:resize', ['$event'])
  onWindowResize($event) {
    // Позволяет перезагрузить компонент при изменении размера окна
  }

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
    private translate: TranslateService,
    private res: ResService,
  ) {
    super();
  }

  ngOnInit() {
    this.wasInit = true;
    this.getData();
  }

  updateData() {
    this.getData();
  }

  private getData() {

    if (this.resLink) {
      this.getPages();
      return;
    }

    this.isLoading = true;

    const requestData: GetEduStudentTaskAttemptRequest = {
      firstLoad: false,
      typeActivity: eduActivityTypes.teaching
    };

    this.api.Get<EduStudentTaskAttempt>(
      `edu/task/get/${this.activity}/${this.task}`,
      requestData,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduStudentTaskAttempt,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Task attempt:", response);
        }
        this.taskData = response;
        this.updateTaskAttempt.emit(response);
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
        name: () => this.translate.get('TEACHER_TASKS.ANSWER'),
        block: this.blockNames.answer,
        available: !this.resLink
      },
      {
        name: () => this.translate.get('TEACHER_TASKS.MARK_TITLE'),
        block: this.blockNames.mark,
        available: (() => {
          if (this.resLink) {
            return false;
          }
          if (!this.isMobile()) {
            return true; // Блок оценки виден всегда на компьютере
          }
          if (!this.taskData) {
            return false;
          }
          if (this.taskData.toRevisionStage || this.taskData.checkedStage) {
            return false; // Блок на мобильнике будет показан сверху в виде
            // плашки с полосой. При других статусах показываем закладками.
          }
          return true;
        })()
      },
      {
        name: () => this.translate.get('TEACHER_TASKS.TASK'),
        block: this.blockNames.description,
        available: !this.resLink
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

  isBlockAvailable(blockName: TeacherTaskPageBlockName): boolean {
    if (this.isMobile() && this.availablePages.findIndex(val => val.block === blockName) > -1) {
      return blockName === this.currentBlock;
    } else {
      return this.allPages.length && this.allPages.find(val => val.block === blockName).available;
    }
  }

  changePage(page: PageDescription): false {
    this.currentBlock = page.block;
    return false;
  }

  openResLink(): false {
    this.isLoadingGlobal = true;
    this.res.Open(this.resLink).subscribe({
      error: (err) => {
        this.err.register(err, false, true);
        this.isLoadingGlobal = false;
      },
    });
    return false;
  }

}
