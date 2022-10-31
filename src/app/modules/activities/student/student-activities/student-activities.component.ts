import { Component, Input, Output, EventEmitter, } from '@angular/core';
import { ApiService } from '@modules/root/api/api.service';
import { AppComponentTemplate } from '@shared/component.template';
import { APIServiceNames } from '@modules/root/api/api.interface';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { EduObjectActivities, EduActivity, eduStatuses, EduChildTemplate, EduActivityFilterParam, EduStatus } from '../../activities.interface';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Router } from '@angular/router';
import { ResService } from '@modules/resources/res/res.service';
import { SettingsService } from '@modules/root/settings/settings.service';
import { StudentActivityFilter, StudentActivityFilterInterface, studentActivityFilters } from '@modules/root/settings/settings.interface';
import { TranslateService } from '@ngx-translate/core';
import { DatesTools } from '@modules/root/dates/dates.class';
import * as dayjs from 'dayjs';

interface Element {
  activity: EduActivity;
  template: EduChildTemplate;
}

interface ActivityFilter extends StudentActivityFilterInterface {
  active: boolean;
  title: string;
}

interface FilterSettings {
  onlyActual: boolean;
  activityFilters: ActivityFilter[];
}

interface Section {
  isRoot: boolean;
  name: string;
  elements: Element[];
  isOpen: boolean;
  filterSettings: FilterSettings;
  filtered(): Element[];
}

function filterFunc(elements: Element[], filterSettings: FilterSettings): Element[] {
  if (filterSettings.onlyActual) {
    return elements.filter(val => val.activity.actual);
  }
  return elements;
}

@Component({
  selector: 'app-student-activities',
  templateUrl: './student-activities.component.html',
  styleUrls: ['./student-activities.component.scss']
})
export class StudentActivitiesComponent extends AppComponentTemplate {

  @Input() shortList = false;
  @Output() emitPrimaryActivity = new EventEmitter<EduActivity>();

  isLoading = false;
  isLoadingGlobal = false;
  statuses = eduStatuses;
  sections: Section[] = [];
  settingsService: SettingsService = this.settings;
  activities: EduObjectActivities;

  filterSettingsName = this.settings.StorageName("studentActivitiesFilterSettings");
  filterSettings: FilterSettings;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
    private router: Router,
    private res: ResService,
    private settings: SettingsService,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit() {
    this.getData();
  }

  defaultFilterSettings(): FilterSettings {

    const filterSettings: FilterSettings = {
      onlyActual: false,
      activityFilters: []
    };

    const activityFilters = this.settings.Activities()?.filters?.studentActivitiesFilters ?? [];
    const lang = this.translate.currentLang;
    for (const filter of activityFilters) {
      const newFilter: ActivityFilter = {
        active: false,
        title: filter.titles[lang] ?? filter.titles.en,
        ...filter
      };
      if (!this.filterIsSupported(newFilter)) {
        continue;
      }
      filterSettings.activityFilters.push(newFilter);
    }

    return filterSettings;

  }

  initFilterSettings() {

    this.filterSettings = this.defaultFilterSettings();

    const savedRawSettings: string = localStorage.getItem(this.filterSettingsName);

    if (!savedRawSettings) {
      return;
    }

    const savedSettings: FilterSettings = JSON.parse(savedRawSettings);

    if ("onlyActual" in savedSettings) {
      this.filterSettings.onlyActual = savedSettings.onlyActual;
    }

    if ("activityFilters" in savedSettings) {
      for (const savedFilter of savedSettings.activityFilters) {
        const currentFilter = this.filterSettings.activityFilters.find(val => val.name === savedFilter.name);
        if (!currentFilter) {
          continue;
        }
        currentFilter.active = savedFilter.active;
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

  displayOnlyActual(): boolean {
    if (this.shortList) {
      return false;
    }
    if (this.displayFilters()) {
      return true;
    }
    if (!this.sections) {
      return false;
    }
    const isNotActual = this.sections.findIndex(val1 => val1.elements.findIndex(val2 => !val2.activity.actual) > -1) > -1;
    return isNotActual;
  }

  displayFilters(): boolean {
    if (this.shortList) {
      return false;
    }
    if (!this.filterSettings) {
      return false;
    }
    if (this.filterSettings.activityFilters.length < 2) {
      return false;
    }
    return true;
  }

  selectFilter(selectedFilter: ActivityFilter) {
    for (const filter of this.filterSettings.activityFilters) {
      filter.active = selectedFilter.name === filter.name;
    }
    this.getSections();
    this.saveFilterSettings();
  }

  currentFilter(): StudentActivityFilter {
    if (!this.filterSettings) {
      return studentActivityFilters.default;
    }
    if (this.filterSettings.activityFilters.length === 1) {
      return this.filterSettings.activityFilters[0].name;
    }
    const currentFilter = this.filterSettings.activityFilters.find(val => val.active);
    if (!currentFilter) {
      return studentActivityFilters.default;
    }
    return currentFilter.name;
  }

  getData() {

    this.isLoading = true;
    this.activities = undefined;

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
        if (!response) {
          return;
        }
        this.emitPrimaryActivity.emit(response.primaryEducationActivity);
        this.activities = response;
        this.initFilterSettings();
        this.getSections();

      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );

  }

  filterIsSupported(filter: ActivityFilter): boolean {
    const filterName = filter?.name;
    switch (filterName) {
      case studentActivityFilters.kindEducation:
        return !!this.activities.allEducation.find(val => !!val.kindEducation);
      case studentActivityFilters.module:
        return !!this.activities.allEducation.find(val => !!val.module);
      case studentActivityFilters.subject:
        return !!this.activities.allEducation.find(val => !!val.subject);
      case studentActivityFilters.week:
        return !!this.activities.allEducation.length;
      case studentActivityFilters.month:
        return !!this.activities.allEducation.length;
      case studentActivityFilters.year:
        return !!this.activities.allEducation.length;
      case studentActivityFilters.default:
        return !!this.activities.allEducation.length;
      case studentActivityFilters.status:
        return !!this.activities.allEducation.length;
      default:
        return false;
    }
  }

  getSections() {

    this.sections = [];

    if (!this.activities) {
      return;
    }

    if (this.shortList) {

      this.doShortList();

    } else {

      const currentFilter = this.currentFilter();

      switch (currentFilter) {
        case studentActivityFilters.kindEducation:
          this.doKindEducationList();
          break;
        case studentActivityFilters.module:
          this.doModuleList();
          break;
        case studentActivityFilters.subject:
          this.doSubjectList();
          break;
        case studentActivityFilters.week:
          this.doDateList(currentFilter);
          break;
        case studentActivityFilters.month:
          this.doDateList(currentFilter);
          break;
        case studentActivityFilters.year:
          this.doDateList(currentFilter);
          break;
        case studentActivityFilters.status:
          this.doStatusList();
          break;
        default:
          this.doDefaultList();
          break;
      }

    }

    this.sections = this.sections.filter(val => !!val.elements.length);

  }

  visibleSections(): Section[] {
    return this.sections.filter(val => val.filtered().length);
  }

  doShortList() {

    const shortList = this.activities.shortEducation;

    // Создаем корневую секцию
    const rootSection: Section = {
      isRoot: true,
      name: "",
      elements: shortList
        .map((val) => {
          return {
            activity: val,
            template: null
          };
        }),
      isOpen: true,
      filterSettings: this.filterSettings,
      filtered: function () {
        return filterFunc(this.elements, this.filterSettings);
      }
    };
    this.sections.push(rootSection);

    if (environment.displayLog) {
      console.log("Student short list:", this.sections);
    }

  }

  doKindEducationList() {

    const allEducation = this.activities.allEducation;

    // Создаем секцию для видов обучений

    const kinds: EduActivityFilterParam[] =
      allEducation.filter((v, i, a) => a.findIndex(
        v2 => v.kindEducation && v2.kindEducation && v2.kindEducation.id === v.kindEducation.id) === i)
        .map(val => val.kindEducation); // Находим только уникальные виды обучения

    for (const kind of kinds) {
      const newSection: Section = {
        isRoot: false,
        name: kind.name,
        elements: allEducation.filter(v => v.kindEducation?.id === kind.id).map((val) => {
          return {
            activity: val,
            template: null
          };
        }),
        isOpen: true,
        filterSettings: this.filterSettings,
        filtered: function () {
          return filterFunc(this.elements, this.filterSettings);
        }
      };
      this.sections.push(newSection);
    }

    if (environment.displayLog) {
      console.log("Kind education sections:", this.sections);
    }

  }

  doModuleList() {

    const allEducation = this.activities.allEducation;

    // Создаем корневую секцию
    const rootSection: Section = {
      isRoot: true,
      name: "",
      elements: allEducation
        .filter((val) => !val.module)
        .map((val) => {
          return {
            activity: val,
            template: null
          };
        }),
      isOpen: true,
      filterSettings: this.filterSettings,
      filtered: function () {
        return filterFunc(this.elements, this.filterSettings);
      }
    };
    this.sections.push(rootSection);

    // Создаем секцию для программ обучения

    const modules: EduActivityFilterParam[] =
      allEducation.filter((v, i, a) => a.findIndex(
        v2 => v2.module && v.module && v2.module.id === v.module.id) === i)
        .map(val => val.module); // Находим только уникальные программы обучения

    for (const module of modules) {

      const moduleEducation = allEducation.filter(v => v.module?.id === module.id);
      const isIndexNumber: boolean = moduleEducation.findIndex(val => !!val.indexNumber) > -1;

      if (isIndexNumber) {
        // Сортировка по приоритету
        moduleEducation.sort((element1, element2) => {
          if (element1.indexNumber === element2.indexNumber) {
            return ('' + element1.name).localeCompare('' + element2.name)
          } else {
            return (element1.indexNumber > element2.indexNumber) ? 1 : -1;
          }
        });
      }

      const newSection: Section = {
        isRoot: false,
        name: module.name,
        elements: moduleEducation.map((val) => {
          return {
            activity: val,
            template: null
          };
        }),
        isOpen: true,
        filterSettings: this.filterSettings,
        filtered: function () {
          return filterFunc(this.elements, this.filterSettings);
        }
      };
      this.sections.push(newSection);
    }

    if (environment.displayLog) {
      console.log("Module sections:", this.sections);
    }

  }

  doSubjectList() {

    const allEducation = this.activities.allEducation;

    // Создаем корневую секцию
    const rootSection: Section = {
      isRoot: true,
      name: "",
      elements: allEducation
        .filter((val) => !val.subject)
        .map((val) => {
          return {
            activity: val,
            template: null
          };
        }),
      isOpen: true,
      filterSettings: this.filterSettings,
      filtered: function () {
        return filterFunc(this.elements, this.filterSettings);
      }
    };
    this.sections.push(rootSection);

    const subjects: EduActivityFilterParam[] =
      allEducation.filter((v, i, a) => a.findIndex(
        v2 => v.subject && v2.subject && v2.subject.id === v.subject.id) === i)
        .map(val => val.subject); // Находим только уникальные виды обучения

    for (const subject of subjects) {
      const newSection: Section = {
        isRoot: false,
        name: subject.name,
        elements: allEducation.filter(v => v.subject?.id === subject.id).map((val) => {
          return {
            activity: val,
            template: null
          };
        }),
        isOpen: true,
        filterSettings: this.filterSettings,
        filtered: function () {
          return filterFunc(this.elements, this.filterSettings);
        }
      };
      this.sections.push(newSection);
    }

    if (environment.displayLog) {
      console.log("Subject sections:", this.sections);
    }

  }

  doDateList(currentFilter: StudentActivityFilter) {

    const allEducation = this.activities.allEducation;

    if (!allEducation.length) {
      return;
    }

    // Создаем корневую секцию
    const rootSection: Section = {
      isRoot: true,
      name: "",
      elements: allEducation
        .filter((val) => DatesTools.IsEmptyDate(val.startDate))
        .map((val) => {
          return {
            activity: val,
            template: null
          };
        }),
      isOpen: true,
      filterSettings: this.filterSettings,
      filtered: function () {
        return filterFunc(this.elements, this.filterSettings);
      }
    };
    this.sections.push(rootSection);

    const minMax = (mathFunc: (...values: number[]) => number) => {
      return new Date(mathFunc(...allEducation
        .filter(val => !DatesTools.IsEmptyDate(val.startDate))
        .map(val => val.startDate.getTime())));
    };

    const minDate: Date = minMax(Math.min);
    const maxDate: Date = minMax(Math.max);
    const sectionNames: string[] = [];
    let getPeriodName: (date: Date) => string = undefined;
    let getNextPeriod: (date: Date, num: number) => Date = undefined;
    let getStartPeriod: (date: Date) => Date = undefined;

    if (currentFilter === studentActivityFilters.year) {

      getPeriodName = (date: Date) => {
        return String(date.getFullYear());
      };
      getNextPeriod = DatesTools.addYears;
      getStartPeriod = DatesTools.startYear;

    }

    if (currentFilter === studentActivityFilters.month) {

      getPeriodName = (date: Date) => {
        return dayjs(date).format('MMMM YYYY');
      };
      getNextPeriod = DatesTools.addMonth;
      getStartPeriod = DatesTools.startMonth;

    }

    if (currentFilter === studentActivityFilters.week) {

      getPeriodName = (date: Date) => {
        return dayjs(date).format('LL') + " - " + dayjs(date).endOf('week').format('LL');
      };
      getNextPeriod = DatesTools.addWeeks;
      getStartPeriod = DatesTools.startWeek;

    }


    let currentPeriod = getStartPeriod(maxDate);
    while (currentPeriod >= getStartPeriod(minDate)) {
      sectionNames.push(getPeriodName(currentPeriod));
      currentPeriod = getNextPeriod(currentPeriod, -1);
    }

    if (environment.displayLog) {
      console.log("Date section names:", sectionNames);
    }


    for (const sectionName of sectionNames) {

      const newSection: Section = {
        isRoot: false,
        name: sectionName,
        elements: allEducation.filter(v => !DatesTools.IsEmptyDate(v.startDate)
          && getPeriodName(getStartPeriod(v.startDate)) === sectionName).map((val) => {
            return {
              activity: val,
              template: null
            };
          }),
        isOpen: true,
        filterSettings: this.filterSettings,
        filtered: function () {
          return filterFunc(this.elements, this.filterSettings);
        }
      };
      this.sections.push(newSection);

    }

    if (environment.displayLog) {
      console.log("Date sections:", this.sections);
    }

  }

  doDefaultList() {

    const allEducation = this.activities.allEducation;

    // Создаем корневую секцию
    const rootSection: Section = {
      isRoot: true,
      name: "",
      elements: allEducation
        .filter((val) => !val.parentActivity && !val.childActivities)
        .map((val) => {
          return {
            activity: val,
            template: null
          };
        }),
      isOpen: true,
      filterSettings: this.filterSettings,
      filtered: function () {
        return filterFunc(this.elements, this.filterSettings);
      }
    };
    this.sections.push(rootSection);

    // Создаем секцию для общих мероприятий
    const allComplex = allEducation.filter((val) => !!val.childActivities && val.childActivities.length);
    for (const currentComplexEdu of allComplex) {
      const newSection: Section = {
        isRoot: false,
        name: currentComplexEdu.name,
        elements: currentComplexEdu.childActivities.map((val) => {
          return {
            activity: allEducation.find((val2) => val2.eduTemplate === val.templateActivity
              && val2.parentActivity === currentComplexEdu.id),
            template: val
          };
        }),
        isOpen: true,
        filterSettings: this.filterSettings,
        filtered: function () {
          return filterFunc(this.elements, this.filterSettings);
        }
      };
      this.sections.push(newSection);
    }

    if (environment.displayLog) {
      console.log("Default sections:", this.sections);
    }

  }

  doStatusList() {

    const allEducation = this.activities.allEducation;

    const activitiesStatuses: EduStatus[] =
      allEducation.filter((v, i, a) => a.findIndex(
        v2 => v.statusEducation && v2.statusEducation && v2.statusEducation === v.statusEducation) === i)
        .map(val => val.statusEducation); // Находим только уникальные статусы обучений
    const allStatuses: EduStatus[] = Object.keys(eduStatuses).map(statusKey => eduStatuses[statusKey]);
    const statuses: EduStatus[] = allStatuses.filter(status => activitiesStatuses.indexOf(status) > -1);

    for (const status of statuses) {
      this.translate.get("STUDENT_ACTIVITY.STATUSES." + status).subscribe(
        statusName => {
          const newSection: Section = {
            isRoot: false,
            name: statusName,
            elements: allEducation.filter(v => v.statusEducation === status && v.durationLeft !== -1).map((val) => {
              return {
                activity: val,
                template: null
              };
            }),
            isOpen: true,
            filterSettings: this.filterSettings,
            filtered: function () {
              return filterFunc(this.elements, this.filterSettings);
            }
          };
          this.sections.push(newSection);
        },
        (error) => this.err.register(error)
      )
    }

    this.translate.get("STUDENT_ACTIVITY.DURATION.IS_UP").subscribe(
      statusName => {
        const newSection: Section = {
          isRoot: false,
          name: statusName,
          elements: allEducation.filter(v => v.durationLeft === -1).map((val) => {
            return {
              activity: val,
              template: null
            };
          }),
          isOpen: true,
          filterSettings: this.filterSettings,
          filtered: function () {
            return filterFunc(this.elements, this.filterSettings);
          }
        };
        this.sections.push(newSection);
      },
      (error) => this.err.register(error)
    );

    if (environment.displayLog) {
      console.log("Status sections:", this.sections);
    }

  }

  openActivity(activity: EduActivity) {
    this.router.navigate(['/education', 'activity', activity.id]);
  }

  openRes(activity: EduActivity) {

    this.isLoadingGlobal = true;

    this.res.Open({
      electronicCourse: activity.singleTask.electronicCourse,
      electronicResource: activity.singleTask.electronicResource,
      userActivity: activity.id,
      task: activity.singleTask.task,
      fragment: activity.singleTask.fragment,
      readonly: !activity.actual
    }).subscribe({
      error: (err) => {
        this.err.register(err, false, true);
        this.isLoadingGlobal = false;
      },
    });

  }

  openCloseSection(section: Section) {
    section.isOpen = !section.isOpen;
  }

}
