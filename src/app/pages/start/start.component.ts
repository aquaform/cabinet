import { Component, HostBinding, ElementRef, ViewChild, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '@modules/root/i18n/i18n.class';
import { AuthService } from '@modules/auth/auth.service';
import { StartBlockName, startBlockNames } from '@modules/auth/auth.interface';
import { EduActivity } from '@modules/activities/activities.interface';
import { StartPageDataToPrimaryBlock } from '@modules/root/nav/nav.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { NavService } from '@modules/root/nav/nav.service';


interface PageDescription {
  name: () => Observable<string>;
  block: StartBlockName;
  available: boolean;
}

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
})
export class StartComponent extends AppComponentTemplate {

  @HostBinding('class.page-host') isPage = true;

  blockNames = startBlockNames;

  @ViewChild('onlyMobileElement', { static: true }) onlyMobileElement: ElementRef;

  allPages: PageDescription[] = [
    {
      name: () => this.translate.get('NAV.START.STUDENT_ACTIVITIES'),
      block: this.blockNames.studentActivities,
      available: this.auth.StartBlockIsAvailable(this.blockNames.studentActivities)
    },
    {
      name: () => this.translate.get('NAV.START.TEACHER_ACTIVITIES'),
      block: this.blockNames.teacherActivities,
      available: this.auth.StartBlockIsAvailable(this.blockNames.teacherActivities)
    },
    {
      name: () => this.translate.get('NAV.START.TEACHER_TASKS'),
      block: this.blockNames.teacherTasks,
      available: this.auth.StartBlockIsAvailable(this.blockNames.teacherTasks)
    },
    {
      name: () => this.translate.get('NAV.START.NEWS'),
      block: this.blockNames.news,
      available: this.auth.StartBlockIsAvailable(this.blockNames.news)
    },
    {
      name: () => this.translate.get('NAV.START.PIN_CODES'),
      block: this.blockNames.pinCodes,
      available: this.auth.StartBlockIsAvailable(this.blockNames.pinCodes)
    }
  ];

  get availablePages(): PageDescription[] {
    return this.allPages.filter(val => val.available);
  }

  currentBlock: StartBlockName;

  @HostListener('window:resize', ['$event'])
  onWindowResize($event) {
    // Позволяет перезагрузить компонент при изменении размера окна
  }

  constructor(
    private translate: TranslateService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private nav: NavService) {

    super();
    Language.init(this.translate);

    if (this.availablePages.length) {
      this.currentBlock = this.availablePages[0].block;
    }

  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
        this.currentBlock = (params.block) ? params.block : '';
        if (!this.currentBlock && this.availablePages.length) {
          this.currentBlock = this.availablePages[0].block;
        }
        this.setDataToPrimaryBlock();
      });
  }

  setDataToPrimaryBlock() {
    if (!this.isBlockAvailable(this.blockNames.studentActivities)) {
      const dataToPrimaryBlock: StartPageDataToPrimaryBlock = {
        primaryEducationActivity: null
      };
      this.nav.UpdatePrimaryBlockData(dataToPrimaryBlock);
    }
  }

  isMobile(): boolean {
    if (!this.onlyMobileElement) {
      return false;
    }
    return !(this.onlyMobileElement.nativeElement.offsetParent === null);
    // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  }

  isBlockAvailable(blockName: StartBlockName): boolean {
    if (this.isMobile() && this.availablePages.findIndex(val => val.block === blockName) > -1) {
      return blockName === this.currentBlock;
    } else {
      return this.auth.StartBlockIsAvailable(blockName);
    }
  }

  setPrimaryActivity(activity: EduActivity) {
    const dataToPrimaryBlock: StartPageDataToPrimaryBlock = {
      primaryEducationActivity: activity
    };
    this.nav.UpdatePrimaryBlockData(dataToPrimaryBlock);
  }

  goToPage(page: PageDescription) {
    this.router.navigate(['/start', page.block]);
  }

}
