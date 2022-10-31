import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { educationPageBlockNames, EducationPageBlockName } from '@modules/activities/activities.interface';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AppComponentTemplate } from '@shared/component.template';
import { SettingsService } from '@modules/root/settings/settings.service';

interface PageDescription {
  name: () => Observable<string>;
  block: EducationPageBlockName;
  available: boolean;
}

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent extends AppComponentTemplate {

  blockNames = educationPageBlockNames;

  @ViewChild('onlyMobileElement', { static: true }) onlyMobileElement: ElementRef;

  allPages: PageDescription[] = [
    {
      name: () => this.translate.get('STUDENT_ACTIVITIES.title'),
      block: this.blockNames.activities,
      available: true
    },
    {
      name: () => this.translate.get('STUDENT_CERTIFICATES.TITLE'),
      block: this.blockNames.certificates,
      available: this.settings.Activities().availableCertificatesPage
    },
    {
      name: () => this.translate.get('STUDENT_OPTIONAL.TITLE'),
      block: this.blockNames.optionalActivities,
      available: this.settings.Activities().availableOpenEduPage
    },
  ];

  get availablePages(): PageDescription[] {
    return this.allPages.filter(val => val.available);
  }

  currentBlock: EducationPageBlockName = this.availablePages[0].block;

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
        this.currentBlock = (params.block) ? params.block : this.availablePages[0].block;
      });
  }

  isMobile(): boolean {
    if (!this.onlyMobileElement) {
      return false;
    }
    return !(this.onlyMobileElement.nativeElement.offsetParent === null);
    // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  }

  isBlockAvailable(blockName: EducationPageBlockName): boolean {
    if (this.isMobile() && this.availablePages.findIndex(val => val.block === blockName) > -1) {
      return blockName === this.currentBlock;
    } else {
      return this.allPages.find(val => val.block === blockName).available;
    }
  }

  goToPage(page: PageDescription) {
    this.router.navigate(['/education', page.block]);
  }

}
