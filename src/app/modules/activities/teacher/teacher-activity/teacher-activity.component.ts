import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { environment } from '@environments/environment';
import { ApiService } from '@modules/root/api/api.service';
import { eduActivityTypes, TeacherActivityPageBlockName, teacherActivityPageBlockNames } from '../../activities.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';
import { EduTeacherActivityDescription, EduTeacherActivityDescriptionResponse } from '../teacher.interface';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SettingsService } from '@modules/root/settings/settings.service';
import { backendReportsAllocations } from '@modules/root/settings/settings.interface';

interface PageDescription {
  name: () => Observable<string>;
  block: TeacherActivityPageBlockName;
  available: boolean;
}

@Component({
  selector: 'app-teacher-activity',
  templateUrl: './teacher-activity.component.html',
  styleUrls: ['./teacher-activity.component.scss']
})
export class TeacherActivityComponent extends AppComponentTemplate {

  @Input() uuid: string;
  @Output() getTitle = new EventEmitter<string>();

  activity: EduTeacherActivityDescription;
  isLoading = false;

  @ViewChild('onlyMobileElement', { static: true }) onlyMobileElement: ElementRef;
  blockNames = teacherActivityPageBlockNames;
  allPages: PageDescription[] = [];
  availablePages: PageDescription[] = [];
  currentBlock: TeacherActivityPageBlockName;
  backendReportsAllocations = backendReportsAllocations;
  reportsAvailable = this.settings.BackendReportsIsAvailable(backendReportsAllocations.teacherActivityPage);

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
    private settings: SettingsService
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

  refreshData() {
    this.getData();
  }

  private getData() {
    this.isLoading = true;
    this.api.Get<EduTeacherActivityDescriptionResponse>(
      `edu/activity/get/${eduActivityTypes.teaching}/${this.uuid}`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduTeacherActivityDescriptionResponse,
      APIDataTypes.xml
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Teacher activity:", response);
        }
        this.activity = response.response.teacherActivity;
        this.getTitle.emit(this.activity.name);
        this.getPages();
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );
  }

  getPages() {
    this.allPages = [
      {
        name: () => this.translate.get('TEACHER_ACTIVITY.CHECK_LIST.TITLE'),
        block: this.blockNames.checkList,
        available: true
      },
      {
        name: () => this.translate.get('TEACHER_ACTIVITY.DESCRIPTION'),
        block: this.blockNames.description,
        available: true
      },
      {
        name: () => this.translate.get('TEACHER_ACTIVITY.RESOURCES.TITLE'),
        block: this.blockNames.resources,
        available: !!this.activity.isResources
      },
      {
        name: () => this.translate.get('TEACHER_ACTIVITY.TEACHERS.TITLE'),
        block: this.blockNames.teachers,
        available: true
      },
      {
        name: () => this.translate.get('REPORTS.BACKEND.TITLE'),
        block: this.blockNames.reports,
        available: this.reportsAvailable
      },
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

  isBlockAvailable(blockName: TeacherActivityPageBlockName): boolean {
    if (this.isMobile() && this.availablePages.findIndex(val => val.block === blockName) > -1) {
      return blockName === this.currentBlock;
    } else {
      return this.allPages.find(val => val.block === blockName).available;
    }
  }

  goToPage(page: PageDescription) {
    this.router.navigate(['/teaching', 'activity', this.uuid, page.block]);
  }



}
