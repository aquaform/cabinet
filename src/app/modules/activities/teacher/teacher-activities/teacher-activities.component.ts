import { Component, Input, } from '@angular/core';
import { ApiService } from '@modules/root/api/api.service';
import { AppComponentTemplate } from '@shared/component.template';
import { APIServiceNames } from '@modules/root/api/api.interface';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { EduObjectActivities, EduActivity, eduStatuses, statusesTeacherActivity, statusTeacherActivityToColor } from '../../activities.interface';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Router } from '@angular/router';
import { SettingsService } from '@modules/root/settings/settings.service';

interface FilterSettings {
  onlyActual: boolean;
}

function filterFunc(elements: EduActivity[], filterSettings: FilterSettings): EduActivity[] {
  if (filterSettings.onlyActual) {
    return elements.filter(val => val.teacherStatus === statusesTeacherActivity.IN_PROGRESS
        || val.teacherStatus === statusesTeacherActivity.SCHEDULED);
  }
  return elements;
}

@Component({
  selector: 'app-teacher-activities',
  templateUrl: './teacher-activities.component.html',
  styleUrls: ['./teacher-activities.component.scss']
})
export class TeacherActivitiesComponent extends AppComponentTemplate {

  @Input() shortList = false;

  isLoading = false;
  activities: EduActivity[];

  statuses = eduStatuses;
  settingsService: SettingsService = this.settings;

  statusesTeacherActivity = statusesTeacherActivity;
  statusTeacherActivityToColor = statusTeacherActivityToColor;

  filterSettingsName = this.settings.StorageName("teacherActivitiesFilterSettings");
  filterSettings: FilterSettings;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
    private router: Router,
    private settings: SettingsService
  ) {
    super();
  }

  ngOnInit() {

    this.initFilterSettings();

    this.isLoading = true;

    this.api.Get<EduObjectActivities>(
      'edu/activities/all/All/0/0',
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduObjectActivities
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("All activities:", response);
        }
        // TODO eduActivityTypes
        // Сделать отбор по типу активности при запросе к базе
        this.activities = (this.shortList) ? response.shortTeaching : response.allTeaching;
        if (environment.displayLog) {
          console.log("Teacher activities:", this.activities);
        }
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );

  }

  openActivity(activity: EduActivity) {
    this.router.navigate(['/teaching', 'activity', activity.id]);
  }

  defaultFilterSettings(): FilterSettings {
    const filterSettings: FilterSettings = {
      onlyActual: false
    };
    return filterSettings;
  }

  initFilterSettings() {

    this.filterSettings = this.defaultFilterSettings();

    if (this.shortList) {
      return;
    }

    const savedRawSettings: string = localStorage.getItem(this.filterSettingsName);

    if (savedRawSettings) {
      const savedSettings: FilterSettings = JSON.parse(savedRawSettings);
      for (const settingName of Object.keys(savedSettings)) {
        this.filterSettings[settingName] = savedSettings[settingName];
      }
    }

  }

  saveFilterSettings() {
    localStorage.setItem(this.filterSettingsName, JSON.stringify(this.filterSettings));
  }

  changeOnlyActual(): false {
    this.filterSettings.onlyActual = !this.filterSettings.onlyActual;
    this.saveFilterSettings();
    return false;
  }

  displayFilter(): boolean {
    if (this.shortList) {
      return false;
    }
    if (!this.activities) {
      return false;
    }
    const uniqueStatuses = this.activities.filter(
        (v, i, a) => a.findIndex(val => val.statusTeacherActivity === v.statusTeacherActivity) === i);
    // Показываем фильтр, если есть разные статусы
    // https://stackoverflow.com/a/14438954/4604351
    return (uniqueStatuses.length > 1) ? true : false;
  }

  get filtered(): EduActivity[] {
    if (!this.activities) {
      return this.activities;
    }
    return filterFunc(this.activities, this.filterSettings);
  }

}
