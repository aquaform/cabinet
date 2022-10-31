import { Component } from '@angular/core';
import { eduStatuses, EduActivity } from '@modules/activities/activities.interface';
import { SettingsService } from '@modules/root/settings/settings.service';
import { ResService } from '@modules/resources/res/res.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { Router } from '@angular/router';
import { NotificationsService } from '@modules/root/notifications/notifications.service';
import { StartPageDataToPrimaryBlock } from '../nav.interface';
import { NotificationData } from '@modules/root/notifications/notifications.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { NavService } from '../nav.service';

@Component({
  selector: 'app-primary-block',
  templateUrl: './primary-block.component.html',
  styleUrls: ['./primary-block.component.scss']
})
export class PrimaryBlockComponent extends AppComponentTemplate {

  isLoading = true;
  isLoadingGlobal = false;
  settingsService: SettingsService = this.settings;
  eduStatuses = eduStatuses;

  notificationsData: NotificationData;

  private _startPageData: StartPageDataToPrimaryBlock;

  set startPageData(data: StartPageDataToPrimaryBlock) {
    if (!this.isLoading) {
      return;
      // Можем получить данные только один раз,
      // чтобы данные не прыгали при переключении вкладок
      // в мобильном варианте.
    }
    this._startPageData = data;
    this.checkLoading();
  }

  get startPageData(): StartPageDataToPrimaryBlock {
    return this._startPageData;
  }

  get primaryActivity(): EduActivity {
    return (this.startPageData) ? this.startPageData.primaryEducationActivity : null;
  }

  welcomeText: string;

  descriptionText: string;
  descriptionAction: () => false;

  constructor(
    private settings: SettingsService,
    private res: ResService,
    private err: ErrorsService,
    private router: Router,
    private notifications: NotificationsService,
    private translate: TranslateService,
    private nav: NavService
  ) {
    super();
  }

  ngOnInit() {

    this.notifications.GetData$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (notificationsData) => {
          this.notificationsData = notificationsData;
          this.checkLoading();
        },
        (err) => this.err.register(err)
      );

    this.nav.PrimaryBlockData$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (data) => this.startPageData = data,
        (err) => this.err.register(err)
      );

    this.setWelcomeText();

  }

  setWelcomeText() {

    const variants: { hour: number; name: string }[] = [
      { hour: 17, name: 'NAV.PRIMARY.GOOD_EVENING' },
      { hour: 10, name: 'NAV.PRIMARY.GOOD_AFTERNOON' },
      { hour: 5, name: 'NAV.PRIMARY.GOOD_MORNING' },
      { hour: 0, name: 'NAV.PRIMARY.GOOD_NIGHT' }
    ];

    const hour = new Date().getHours();

    for (const currentVariant of variants) {
      if (hour >= currentVariant.hour) {
        this.translate.get(currentVariant.name)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(
            (text) => this.welcomeText = text,
            (err) => this.err.register(err)
          );
        break;
      }
    }

  }

  checkLoading() {

    if (this.startPageData && this.notificationsData) {

      this.isLoading = false;

      let messageName = "";
      let descriptionAction: () => false = null;
      const translateParams: {} = this.notificationsData;

      if (this.notificationsData.countUsersOnline && this.notificationsData.countUsersOnline > 4) {
        messageName = "NAV.PRIMARY.ONLINE";
        descriptionAction = null;
      }

      if (this.notificationsData.countNewForumMessages > 0) {
        messageName = "NAV.PRIMARY.NEW_FORUM";
        descriptionAction = this.openForum;
      }

      if (this.notificationsData.countNewNews > 0) {
        messageName = "NAV.PRIMARY.NEW_NEWS";
        descriptionAction = null;
      }

      if (this.notificationsData.countNewPersonalMessages > 0) {
        messageName = "NAV.PRIMARY.NEW_MESSAGES";
        descriptionAction = this.openMessages;
      }

      if (this.primaryActivity && this.primaryActivity.statusEducation === this.eduStatuses.TO_REVISION) {
        messageName = "NAV.PRIMARY.IS_TO_REVISION";
        descriptionAction = null;
      }

      this.descriptionText = "";
      this.descriptionAction = null;

      if (messageName) {
        this.translate.get(messageName, translateParams)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(
            (text) => {
              this.descriptionText = text;
              this.descriptionAction = descriptionAction;
            },
            (err) => this.err.register(err)
          );
      }

    }

  }

  openMessages(): false {
    this.router.navigate(['/messages']);
    return false;
  }

  openForum(): false {
    this.router.navigate(['/forum']);
    return false;
  }

  openActivity() {
    if (!this.primaryActivity) {
      return;
    }
    this.router.navigate(['/education', 'activity', this.primaryActivity.id]);
  }

  continueResEducation() {

    if (!this.primaryActivity) {
      return;
    }

    this.isLoadingGlobal = true;

    this.res.Open({
      electronicCourse: this.primaryActivity.singleTask.electronicCourse,
      electronicResource: this.primaryActivity.singleTask.electronicResource,
      userActivity: this.primaryActivity.id,
      task: this.primaryActivity.singleTask.task,
      fragment: this.primaryActivity.singleTask.fragment,
      readonly: !this.primaryActivity.actual
    }).subscribe({
      error: (err) => {
        this.err.register(err, false, true);
        this.isLoadingGlobal = false;
      },
    });

  }


}
