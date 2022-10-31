import { Component } from '@angular/core';
import { AuthService } from '@modules/auth/auth.service';
import { AppComponentTemplate } from "@shared/component.template";
import { takeUntil, take, filter, map } from "rxjs/operators";
import { ErrorsService } from './modules/root/errors/errors.service';
import { authStatuses } from './modules/auth/auth.interface';
import { Router, NavigationStart } from '@angular/router';
import { Language } from '@modules/root/i18n/i18n.class';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from '@modules/root/notifications/notifications.service';
import { Title } from '@angular/platform-browser';
import { SettingsService } from '@modules/root/settings/settings.service';
import { IdleService } from '@modules/root/idle/idle.service';
import { StatisticsService } from '@modules/root/statistics/statistics.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends AppComponentTemplate {

  authStatuses = authStatuses;
  authStatus: authStatuses = authStatuses.UNKNOWN;
  notificationsTimer: NodeJS.Timer;
  startPath = "";

  constructor(
    private auth: AuthService,
    private err: ErrorsService,
    private router: Router,
    private translate: TranslateService,
    private notifications: NotificationsService,
    private titleService: Title,
    private settings: SettingsService,
    private idle: IdleService,
    private statistics: StatisticsService
  ) {

    super();


    Language.init(this.translate);
    this.settings.Check(this.translate, this.err);
    this.statistics.init();
    this.idle.init();


  }

  ngOnInit() {

    this.titleService.setTitle(this.settings.Title());

    this.router.events
      .pipe(takeUntil(this.ngUnsubscribe))
      .pipe(filter(val => {
        return val instanceof NavigationStart;
      })).pipe(take(1), map(val => (val as NavigationStart).url))
      .subscribe(
        path => {
          this.startPath = decodeURI(path);
          this.authControl();
        },
        err => this.err.register(err)
      );

  }

  authControl() {
    this.auth.OnChange$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        status => {

          this.authStatus = status;

          // Делаем редирект на страницу входа
          if (this.authStatus === this.authStatuses.NOT_AUTHENTICATED) {

            const initPath = '/auth';
            const altPath = '/changePassword'; // Для совместимости с ссылкой ВК 2.0

            if (this.startPath && (this.startPath.substr(0, initPath.length) === initPath
              || this.startPath.substr(0, altPath.length) === altPath)) {
              this.router.navigate([this.startPath], { replaceUrl: true });
            } else {
              this.router.navigate([initPath], { replaceUrl: true });
            }

          }

          // Устанавливаем получение уведомлений раз в минуту
          if (this.authStatus === this.authStatuses.AUTHENTICATED) {
            this.notifications.RefreshFromServer();
            if (!this.notificationsTimer) {
              this.notificationsTimer = setInterval(
                () => this.notifications.RefreshFromServer(), 60 * 5 * 1000);
            }
          } else {
            if (this.notificationsTimer) {
              clearTimeout(this.notificationsTimer);
            }
          }

        },
        err => this.err.register(err)
      );
  }

}
