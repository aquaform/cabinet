import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { environment } from '@environments/environment';
import { ApiService } from '@modules/root/api/api.service';
import { eduActivityTypes, studentActivityPageBlockNames, StudentActivityPageBlockName } from '../../activities.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';
import { EduStudentActivityDescriptionResponse, EduStudentActivityDescription, QualityPollFormData } from '../student.interface';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';

interface PageDescription {
  name: () => Observable<string>;
  block: StudentActivityPageBlockName;
  available: boolean;
}

@Component({
  selector: 'app-student-activity',
  templateUrl: './student-activity.component.html',
  styleUrls: ['./student-activity.component.scss']
})
export class StudentActivityComponent extends AppComponentTemplate {

  @Input() uuid: string;
  @Output() getTitle = new EventEmitter<string>();

  activity: EduStudentActivityDescription;
  isLoading = false;

  @ViewChild('onlyMobileElement', { static: true }) onlyMobileElement: ElementRef;
  blockNames = studentActivityPageBlockNames;
  allPages: PageDescription[] = [];
  availablePages: PageDescription[] = [];
  currentBlock: StudentActivityPageBlockName;

  pollFormData: QualityPollFormData;

  @HostListener('window:resize', ['$event'])
  onWindowResize($event) {
    // Позволяет перезагрузить компонент при изменении размера окна
  }

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
    private translate: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit() {

    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
        this.currentBlock = (params.block) ? params.block : null;
      });

    this.getData();

  }

  refreshData(response?: EduStudentActivityDescriptionResponse) {
    if (response) {
      this.processResponseData(response);
    } else {
      this.getData();
    }
  }

  getData() {
    this.isLoading = true;
    this.api.Get<EduStudentActivityDescriptionResponse>(
      `edu/activity/get/${eduActivityTypes.education}/${this.uuid}`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduStudentActivityDescriptionResponse,
      APIDataTypes.xml
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Student activity:", response);
        }
        this.processResponseData(response);
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );
  }

  processResponseData(response: EduStudentActivityDescriptionResponse) {
    this.activity = response.response.userActivity;
    this.getTitle.emit(this.activity.name);
    this.getPages();
  }

  getPages() {
    this.allPages = [
      {
        name: () => this.translate.get('STUDENT_ACTIVITY.DESCRIPTION'),
        block: this.blockNames.description,
        available: true
      },
      {
        name: () => this.translate.get('STUDENT_ACTIVITY.TASK'),
        block: this.blockNames.task,
        available: this.activity.availableSingleTaskPage
      },
      {
        name: () => this.translate.get('STUDENT_ACTIVITY.TASKS.title'),
        block: this.blockNames.tasks,
        available: this.activity.availableTasksPage
      },
      {
        name: () => this.translate.get('STUDENT_ACTIVITY.RESOURCES.TITLE'),
        block: this.blockNames.resources,
        available: this.activity.availableResourcesPage
      },
      {
        name: () => this.translate.get('REPORTS.QUIZ.TITLE'),
        block: this.blockNames.quizResults,
        available: this.activity.showQuizResults && this.isMobile()
      },
      {
        name: () => this.translate.get('STUDENT_ACTIVITY.TEACHERS.TITLE'),
        block: this.blockNames.teachers,
        available: this.activity.availableTeachersList
      },
      {
        name: () => this.translate.get('STUDENT_ACTIVITY.PARTICIPANTS.TITLE'),
        block: this.blockNames.students,
        available: this.activity.availableParticipantsList
      },
      {
        name: () => this.translate.get('STUDENT_ACTIVITY.MY_FILES'),
        block: this.blockNames.userFiles,
        available: this.activity.availableFileUpload
      },
      {
        name: () => of(this.activity.titleQualityPoll),
        block: this.blockNames.poll,
        available: !!this.activity.availableQualityPoll
      },
      {
        name: () => this.translate.get('REPORTS.ACTIVITY_POLL.TITLE'),
        block: this.blockNames.pollResults,
        available: !!this.activity.availableQualityPollResults
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

  isBlockAvailable(blockName: StudentActivityPageBlockName): boolean {
    if (this.isMobile() && this.availablePages.findIndex(val => val.block === blockName) > -1) {
      return blockName === this.currentBlock;
    } else {
      return this.allPages.find(val => val.block === blockName).available;
    }
  }

  goToPage(page: PageDescription) {
    this.router.navigate(['/education', 'activity', this.uuid, page.block]);
  }

  updatePollFormData(formData: QualityPollFormData) {
    this.pollFormData = null;
    setTimeout(() => {
      this.pollFormData = formData;
    }, 100);
  }

}
