import { Component, ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { AppComponentTemplate } from '@shared/component.template';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { Router } from '@angular/router';
import { EduObjectActivities, EduActivity, eduActivityTypes, eduStatuses } from '@modules/activities/activities.interface';
import { APIServiceNames } from '@modules/root/api/api.interface';
import { environment } from '@environments/environment';
import { takeUntil } from 'rxjs/operators';
import { SettingsService } from '@modules/root/settings/settings.service';
import ruLocale from '@fullcalendar/core/locales/ru';
import { Language } from '@modules/root/i18n/i18n.class';
import { TranslateService } from '@ngx-translate/core';
import { DatesTools } from '@modules/root/dates/dates.class';
import { StudentOptionalActivityListElement } from '@modules/activities/student/student.interface';
import { BehaviorSubject } from 'rxjs';

type viewType = 'dayGridWeek' | 'dayGridMonth';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent extends AppComponentTemplate {

  @ViewChild('calendar', { static: false }) calendarComponent: FullCalendarComponent; // the #calendar in the template
  calendarPlugins = [dayGridPlugin];
  calendarEvents: EventInput[] = null; // Делается проверка на null в макете
  calendarLocale: any = null;
  activities: EduActivity[] = [];
  defaultDate: Date = new Date();
  defaultDateStorageName: string = this.settings.StorageName("calendarDefaultDate");
  defaultViewStorageName: string = this.settings.StorageName("calendarDefaultView");
  defaultView: viewType = "dayGridWeek";
  currentView: viewType;

  isLoading = false;

  modalOptionalActivityManager = new BehaviorSubject<boolean>(false);
  modalOptionalActivityVisibility = false;
  modalOptionalActivity: StudentOptionalActivityListElement;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
    private router: Router,
    private settings: SettingsService,
    private translate: TranslateService
  ) {

    super();

    if (Language.get(this.translate) === "ru") {
      this.calendarLocale = ruLocale;
    }

    const defaultDateString: string = sessionStorage.getItem(this.defaultDateStorageName);

    if (defaultDateString) {
      this.defaultDate = new Date(Number(defaultDateString));
    } else {
      this.defaultDate = new Date();
    }

    const defaultView: viewType = sessionStorage.getItem(this.defaultViewStorageName) as viewType;
    if (defaultView) {
      this.defaultView = defaultView;
    }

  }

  ngOnInit() {

    this.getData();

    this.modalOptionalActivityManager
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(
      (modalStatus) => {
        if (!modalStatus) {
          this.modalOptionalActivity = null;
        }
        this.modalOptionalActivityVisibility = modalStatus;
      },
      (err) => this.err.register(err)
    );

  }

  getData() {

    this.isLoading = true;
    this.calendarEvents = null;
    this.activities = [];

    const path = 'edu/activities/all/All/0/0';

    this.api.Get<EduObjectActivities>(
      path,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduObjectActivities
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {

        if (environment.displayLog) {
          console.log("Calendar activities:", response);
        }

        this.calendarEvents = [];

        if (!response || !response.length) {
          return;
        }

        const processActivity = (activity: StudentOptionalActivityListElement | EduActivity) => {

          let startDate = activity.startDateToCalendar;
          let endDate = activity.endDateToCalendar;
          let displayArrow = false;
          const currentDate = new Date();
          if (DatesTools.IsEmptyDate(startDate)) {
            if (DatesTools.IsEmptyDate(startDate) && !DatesTools.IsEmptyDate(endDate)
              && endDate.getTime() < currentDate.getTime()) {
              // Если нет даты начала, но есть дата окончания и она уже прошла,
              // то за дату начала принимаем дату окончания.
              startDate = DatesTools.startDay(endDate);
            } else {
              startDate = DatesTools.startDay(currentDate);
            }
          }
          if (DatesTools.IsEmptyDate(endDate)) {
            // Если нет даты окончания
            displayArrow = true;
            if (startDate.getTime() > currentDate.getTime()) {
              // Дата начала еще не наступила, добавляем 3 дня и делаем градиент
              endDate = DatesTools.addDays(startDate, 3);
            } else {
              // Дата начала уже прошла, поэтому датой окончания делаем текущую дату + 1
              endDate = DatesTools.addDays(currentDate, 2);
            }
            endDate = DatesTools.endDay(endDate);
          }
          const eventClasses: string[] = [];
          if (displayArrow) {
            eventClasses.push("fs-event-no-end-date");
          }
          if (activity.colorToCalendar) {
            eventClasses.push("fs-event-is-color");
          }
          if (activity.statusEducation === eduStatuses.NEW) {
            eventClasses.push("fs-event-icon-new");
          }
          if (activity.statusEducation === eduStatuses.TO_REVISION) {
            eventClasses.push("fs-event-icon-problem");
          }
          if (activity.statusEducation === eduStatuses.AUTO) {
            eventClasses.push("fs-event-icon-auto");
          }
          if (activity.statusEducation === eduStatuses.INCOMPLETE) {
            eventClasses.push("fs-event-icon-incomplete");
          }
          if (activity.statusEducation === eduStatuses.NOT_ADMITTED) {
            eventClasses.push("fs-event-icon-not_admitted");
          }
          if (activity.statusEducation === eduStatuses.SCHEDULED) {
            eventClasses.push("fs-event-icon-scheduled");
          }
          if (activity.statusEducation === eduStatuses.COMPLETED_NOT_VERIFIED
            || activity.statusEducation === eduStatuses.VERIFIED) {
            eventClasses.push("fs-event-icon-not_verified");
          }

          const event: EventInput = {
            id: activity.id,
            title: activity.name,
            start: startDate,
            end: endDate,
            color: activity.colorToCalendar,
            className: eventClasses
          };

          this.calendarEvents.push(event);
          this.activities.push(activity);

        }

        for (const activity of response.allActivities) {

          if (activity.type === eduActivityTypes.entryToEducation || activity.type === eduActivityTypes.applicationToEducation) {
            const openActivity = new StudentOptionalActivityListElement();
            for (const key of Object.keys(activity)) {
              openActivity[key] = activity[key];
            }
            if (!openActivity.isHidden) {
              processActivity(openActivity);
            }
          }

          if (activity.type === eduActivityTypes.education || activity.type === eduActivityTypes.teaching) {
            processActivity(activity);
          }

        }

        if (environment.displayLog) {
          console.log("Calendar events:", this.calendarEvents);
        }


      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );

  }

  openActivity(event: any) {
    const id: string = event.event.id;
    const activity = this.activities.find((val) => val.id === id);
    if (!activity) {
      return;
    }
    if (activity.type === eduActivityTypes.education) {
      this.router.navigate(['/education', 'activity', activity.id]);
    }
    if (activity.type === eduActivityTypes.teaching) {
      this.router.navigate(['/teaching', 'activity', activity.id]);
    }
    if (activity.type === eduActivityTypes.applicationToEducation
      || activity.type === eduActivityTypes.entryToEducation) {
        this.modalOptionalActivity = activity as StudentOptionalActivityListElement;
        this.modalOptionalActivityManager.next(true);
    }

  }

  datesRender($event: any) {
    if ($event && $event.view && $event.view.currentStart) {
      const calendarDate: Date = $event.view.currentStart;
      const calendarViewType: viewType = $event.view.type;
      sessionStorage.setItem(this.defaultDateStorageName, String(calendarDate.getTime()));
      sessionStorage.setItem(this.defaultViewStorageName, calendarViewType);
      this.currentView = calendarViewType;
    }
  }

}
