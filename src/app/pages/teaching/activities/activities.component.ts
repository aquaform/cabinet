import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { TeachingPageBlockName, teachingPageBlockNames } from '@modules/activities/activities.interface';
import { TranslateService } from '@ngx-translate/core';
import { AppComponentTemplate } from '@shared/component.template';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { backendReportsAllocations } from '@modules/root/settings/settings.interface';
import { SettingsService } from '@modules/root/settings/settings.service';

interface PageDescription {
  name: () => Observable<string>;
  block: TeachingPageBlockName;
  available: boolean;
}

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent extends AppComponentTemplate {

  blockNames = teachingPageBlockNames;

  @ViewChild('onlyMobileElement', { static: true }) onlyMobileElement: ElementRef;

  backendReportsAllocations = backendReportsAllocations;
  reportsAvailable = this.settings.BackendReportsIsAvailable(backendReportsAllocations.teacherPage);

  allPages: PageDescription[] = [
    {
      name: () => this.translate.get('TEACHER_ACTIVITIES.title'),
      block: this.blockNames.activities,
      available: true
    },
    {
      name: () => this.translate.get('TEACHER_TASKS.TITLE'),
      block: this.blockNames.tasks,
      available: true
    },
    {
      name: () => this.translate.get('REPORTS.BACKEND.TITLE'),
      block: this.blockNames.reports,
      available: this.reportsAvailable
    },
  ];

  currentBlock: TeachingPageBlockName = this.allPages[0].block;

  @HostListener('window:resize', ['$event'])
  onWindowResize($event) {
    // Позволяет перезагрузить компонент при изменении размера окна
  }

  constructor(
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
      this.currentBlock = (params.block) ? params.block : this.allPages[0].block;
    });
  }

  isMobile(): boolean {
    if (!this.onlyMobileElement) {
      return false;
    }
    return !(this.onlyMobileElement.nativeElement.offsetParent === null);
    // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  }

  isBlockAvailable(blockName: TeachingPageBlockName): boolean {
    if (this.isMobile() && this.allPages.findIndex(val => val.block === blockName) > -1) {
      return blockName === this.currentBlock;
    } else {
      return this.allPages.find(val => val.block === blockName).available;
    }
  }

  goToPage(page: PageDescription) {
    this.router.navigate(['/teaching', page.block]);
  }


}
