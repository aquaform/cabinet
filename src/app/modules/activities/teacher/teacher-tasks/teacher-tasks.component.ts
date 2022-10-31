import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { APIServiceNames } from '@modules/root/api/api.interface';
import {
  EduTeacherChangePostponeResponse,
  EduTeacherPostponeRequestParams,
  EduTeacherPostponeTaskAttempt,
  EduTeacherTasksRequestParams,
  EduTeacherTasksToCheck
} from '../teacher.interface';
import { takeUntil } from 'rxjs/operators';
import { AppComponentTemplate } from '@shared/component.template';
import { environment } from '@environments/environment';
import { EduStudentTaskAttempt } from '@modules/activities/student/student.interface';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from '@modules/root/settings/settings.service';
import { DatesTools } from '@modules/root/dates/dates.class';
import { ResLinkParams } from '@modules/resources/res/res.interface';
import { EduUserDescription } from '@modules/activities/activities.interface';
import { Router } from '@angular/router';
import { StringsTools } from '@modules/root/strings/strings.class';

type DashboardCarouselType = "section" | "sectionElement" | "postpone" | "all";

const dashboardCarouselTypes = {
  section: "section" as DashboardCarouselType,
  sectionElement: "sectionElement" as DashboardCarouselType,
  postpone: "postpone" as DashboardCarouselType,
  all: "all" as DashboardCarouselType,
};

interface DashboardSectionCarousel {
  carouselId: string;
  carouselType: DashboardCarouselType;
}

interface DashboardCurrentCarousel {
  id: string;
  type: DashboardCarouselType;
  startIndex: number;
}

interface DashboardCarousel {
  id: string;
  type: DashboardCarouselType;
  openFunction: (arg: any, startIndex: number) => void;
  openFunctionArg: any;
}

type DashboardVariant = "dates" | "providingEducation" | "students";

const dashboardVariants = {
  dates: "dates" as DashboardVariant,
  providingEducation: "providingEducation" as DashboardVariant,
  students: "students" as DashboardVariant,
};

interface DashboardSectionElement extends DashboardSectionCarousel {
  taskAttempts: number[]; // Индексы массива taskAttempts
}

interface DashboardTaskSectionElement extends DashboardSectionElement {
  task: string;
  name: string;
}

interface DashboardProvidingEducationSectionElement extends DashboardSectionElement {
  providingEducation: string;
  name: string;
  tasks: DashboardTaskSectionElement[];
}

interface DashboardSection extends DashboardSectionCarousel {
  isOpen: boolean;
  openClose: () => void;
  getDashboardAttempts: () => DashboardSectionElement[];
}

interface DashboardDateSection extends DashboardSection {
  endDate: Date;
  startDate: Date;
  isToday: boolean;
  providingEducations: DashboardProvidingEducationSectionElement[];
}

interface DashboardProvidingEducationSection extends DashboardSection {
  providingEducation: string;
  name: string;
  tasks: DashboardTaskSectionElement[];
}

interface DashboardStudentsSection extends DashboardSection {
  student: EduUserDescription;
  attempts: DashboardSectionElement;
}

interface DashboardProvidingEducationPageSection extends DashboardSection {
  task: string;
  name: string;
  attempts: DashboardSectionElement;
}

@Component({
  selector: 'app-teacher-tasks',
  templateUrl: './teacher-tasks.component.html',
  styleUrls: ['./teacher-tasks.component.scss']
})
export class TeacherTasksComponent extends AppComponentTemplate {

  @Input() @HostBinding('class.isBlock') isBlock = false; // Это блок заданий на других страницах
  @Input() isShortBlock = false; // Это короткая версия блока заданий на других страницах (используется на десктопах)

  @Input() @HostBinding('class.isDashboard') isDashboard = false; // Это панель управления большим числом заданий
  @Input() dashboardProvidingEducation: string; // Будут показаны только задания проведения обучения в панели управления
  @Input() dashboardTask: string; // Будут показаны только задания определенного шаблона
  @Input() dashboardStartPeriod: number;
  @Input() dashboardEndPeriod: number;

  @Output() emitProvidingEducationName = new EventEmitter<string>();
  @Output() emitTaskName = new EventEmitter<string>();

  countTasksInShortBlock = 4;
  displayLinkToDashboard = false;

  dashboardVariantStorageName = this.settings.StorageName("tasksDashboardVariant");
  dashboardCarouselStorageName = this.settings.StorageName("tasksDashboardCarousel");
  dashboardVariant: DashboardVariant = this.defaultDashboardVariant();
  dashboardMenu: DashboardVariant[] = ["dates", "providingEducation", "students"];
  dashboardVariants = dashboardVariants;
  dashboardDateSections: DashboardDateSection[] = []; // Секции при сортировке по дате
  dashboardProvidingEducationSections: DashboardProvidingEducationSection[] = []; // Секции при сортировке по обучению
  dashboardStudentsSections: DashboardStudentsSection[] = []; // Секции при сортировке по студенту
  dashboardProvidingEducationPageSections: DashboardProvidingEducationPageSection[] = [];

  isLoading = false;
  taskAttempts: EduStudentTaskAttempt[] = []; // Все попытки выполнения заданий
  postponeTaskAttempts: EduStudentTaskAttempt[] = []; // Отложенные попытки выполнения заданий
  openedDashboardSectionElement: DashboardSectionElement; // Открытая на проверку секция из панели управления заданиями
  openedDashboardSection: DashboardSection;
  openedTaskAttemptResLink: ResLinkParams;
  openedTaskAttempt: EduStudentTaskAttempt;
  openedCarousel: DashboardCarousel;
  isPostponeOpened: boolean = false;
  carousels: DashboardCarousel[] = [];

  modalTaskToCheckManager = new BehaviorSubject<boolean>(undefined);
  modalTaskToCheckVisibility = false;
  isLoadingGlobal = false;

  Settings: SettingsService;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
    private settings: SettingsService,
    private router: Router
  ) {
    super();
    this.Settings = this.settings;
  }

  ngOnInit() {

    if (this.isBlock) {
      this.clearOpenedCarousel();
    }

    this.getTasks();

    this.modalTaskToCheckManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => {
          if (modalStatus === undefined) {
            return;
          }
          if (!modalStatus) {
            this.clearOpenedCarousel();
            this.getTasks(); // Обновляем список после закрытия модального окна с заданием
          }
          this.modalTaskToCheckVisibility = modalStatus;
        },
        (err) => this.err.register(err)
      );

  }

  // Получение данных из БД
  //

  private getTasks() {

    const carouselFromLocalStorage =  (this.isBlock) ? undefined : this.getCarouselFromLocalStorage();

    this.isLoading = true;
    this.displayLinkToDashboard = false;
    this.dashboardDateSections = [];
    this.taskAttempts = [];
    this.postponeTaskAttempts = [];
    this.clearOpenedData();

    const requestParams: EduTeacherTasksRequestParams = {};

    if (this.isShortBlock) {
      requestParams.count = this.countTasksInShortBlock + 1; // +1, чтобы проверить наличие большего числа элементов
    }

    if (this.dashboardProvidingEducation) {
      requestParams.providingEducation = this.dashboardProvidingEducation;
    }

    this.api.Get<EduTeacherTasksToCheck>(
      'edu/tasks/check/get',
      requestParams,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduTeacherTasksToCheck
    ).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {

          if (environment.displayLog) {
            console.log("Response tasks to check:", response);
          }

          const isPostponeDateProperty: boolean = (response.length && "postponeDate" in response[0]); // На случай использования старой версии КУ

          if (response && response.length) {

            this.taskAttempts = response.filter(val => DatesTools.IsEmptyDate(val.postponeDate)
              || val.postponeDate.getTime() < val.data.dateToCheckTask.getTime()).map(val => val.data);

            this.postponeTaskAttempts = response.filter(val => !DatesTools.IsEmptyDate(val.postponeDate)
              && val.postponeDate.getTime() >= val.data.dateToCheckTask.getTime()).map(val => val.data);

          }

          DatesTools.sortByDate<EduStudentTaskAttempt>(
            this.taskAttempts, (element) => element.dateToCheckTask, false, true);

          if (this.isShortBlock && this.taskAttempts.length) {
            if (isPostponeDateProperty && this.taskAttempts.length > this.countTasksInShortBlock) {
              this.taskAttempts = this.taskAttempts.filter((val, index) => index < this.countTasksInShortBlock);
              this.displayLinkToDashboard = true;
            }
          }

          if (this.isDashboard) {

            // Фильтруем дополнительно, если КУ не поддерживает параметры
            if (this.dashboardTask) {
              this.taskAttempts = this.taskAttempts.filter(val => val.task === this.dashboardTask);
              if (this.taskAttempts.length) {
                this.emitTaskName.emit(this.taskAttempts[0].name);
              }
            }

            if (this.dashboardProvidingEducation) {
              this.taskAttempts = this.taskAttempts.filter(
                val => val.providingEducation === this.dashboardProvidingEducation);
              if (this.taskAttempts.length) {
                this.emitProvidingEducationName.emit(this.taskAttempts[0].eduTemplateName);
              }
            }

            if (this.dashboardStartPeriod) {
              this.taskAttempts = this.taskAttempts.filter(
                val => val.dateToCheckTask.getTime() > this.dashboardStartPeriod
              );
            }

            if (this.dashboardEndPeriod) {
              this.taskAttempts = this.taskAttempts.filter(
                val => val.dateToCheckTask.getTime() <= this.dashboardEndPeriod
              );
            }

            this.fillDashboard();

            if (!this.taskAttempts.length) {
              this.goToDashboard();
            }

          }

          const allCarousel: DashboardCarousel = {
            type: dashboardCarouselTypes.all,
            id: dashboardCarouselTypes.all,
            openFunction: (arg: undefined, startIndex: number) => {
              this.checkCurrentPage(startIndex);
            },
            openFunctionArg: undefined,
          };

          this.carousels.push(allCarousel);

          const postponeCarousel: DashboardCarousel = {
            type: dashboardCarouselTypes.postpone,
            id: dashboardCarouselTypes.postpone,
            openFunction: (arg: undefined, startIndex: number) => {
              this.openPostpone(startIndex);
            },
            openFunctionArg: undefined,
          }

          this.carousels.push(postponeCarousel);

          if (carouselFromLocalStorage) {
            this.openCarouselFromLocalStorage(carouselFromLocalStorage);
          }

          if (environment.displayLog) {
            console.log("Tasks to check:", this.taskAttempts);
            console.log("Task carousels:", this.carousels);
          }

        },
        (err) => this.err.register(err),
        () => this.isLoading = false
      );

  }

  // Откладывание заданий
  //

  postponeTaskAttempt(taskAttempt: EduStudentTaskAttempt): false {
    this.postpone([taskAttempt]);
    return false;
  }

  postpone(attempts: EduStudentTaskAttempt[]): false {

    const requestParams: EduTeacherPostponeRequestParams = {
      taskAttempts: attempts.map(taskAttempt => {
        const postponeTaskAttempt: EduTeacherPostponeTaskAttempt = {
          userActivity: taskAttempt.userActivity,
          onElectronicResource: (taskAttempt.onElectronicResource) ? true : false,
          taskAttempt: taskAttempt.taskAttempt
        }
        return postponeTaskAttempt;
      })
    };

    if (environment.displayLog) {
      console.log("Postpone request params:", requestParams);
    }

    this.api.Get<EduTeacherChangePostponeResponse>(
      'edu/tasks/postpone',
      requestParams,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduTeacherChangePostponeResponse
    ).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          if (environment.displayLog) {
            console.log("Postpone response:", response);
          }
        },
        (err) => this.err.register(err)
      );

    this.taskAttempts = this.taskAttempts.filter((val, index) => attempts.indexOf(val) === -1);
    this.postponeTaskAttempts.push(...attempts);
    this.fillDashboard();

    return false;

  }

  // Заполнение страниц панели управления
  //

  defaultDashboardVariant(): DashboardVariant {
    const variant = localStorage.getItem(this.dashboardVariantStorageName);
    if (variant) {
      return variant as DashboardVariant;
    }
    return dashboardVariants.dates;
  }

  fillDashboard() {
    this.carousels = [];
    if (this.isDashboardStartPage()) {
      this.fillDashboardDateSection();
      this.fillDashboardProvidingEducationSection();
      this.fillDashboardStudentsSection();
    }
    if (this.dashboardProvidingEducation) {
      this.fillDashboardProvidingEducationPageSection();
    }
  }

  fillDashboardDateSection() {

    this.dashboardDateSections = [];

    const currentDate = new Date();
    const startCurrentDay = DatesTools.startDay(currentDate);

    const sectionDates: Date[] = [];
    sectionDates.push(DatesTools.addYears(startCurrentDay, -1));

    sectionDates.push(DatesTools.addMonth(startCurrentDay, -12));
    sectionDates.push(DatesTools.addMonth(startCurrentDay, -11));
    sectionDates.push(DatesTools.addMonth(startCurrentDay, -10));
    sectionDates.push(DatesTools.addMonth(startCurrentDay, -9));
    sectionDates.push(DatesTools.addMonth(startCurrentDay, -8));
    sectionDates.push(DatesTools.addMonth(startCurrentDay, -7));
    sectionDates.push(DatesTools.addMonth(startCurrentDay, -6));
    sectionDates.push(DatesTools.addMonth(startCurrentDay, -5));
    sectionDates.push(DatesTools.addMonth(startCurrentDay, -4));
    sectionDates.push(DatesTools.addMonth(startCurrentDay, -3));
    sectionDates.push(DatesTools.addMonth(startCurrentDay, -2));
    sectionDates.push(DatesTools.addMonth(startCurrentDay, -1));

    sectionDates.push(DatesTools.addWeeks(startCurrentDay, -3));
    sectionDates.push(DatesTools.addWeeks(startCurrentDay, -2));
    sectionDates.push(DatesTools.addWeeks(startCurrentDay, -1));

    sectionDates.push(DatesTools.addDays(startCurrentDay, -7));
    sectionDates.push(DatesTools.addDays(startCurrentDay, -6));
    sectionDates.push(DatesTools.addDays(startCurrentDay, -5));
    sectionDates.push(DatesTools.addDays(startCurrentDay, -4));
    sectionDates.push(DatesTools.addDays(startCurrentDay, -3));
    sectionDates.push(DatesTools.addDays(startCurrentDay, -2));

    sectionDates.push(startCurrentDay);

    sectionDates.push(currentDate);

    for (const taskAttempt of this.taskAttempts) {

      let startDate: Date = new Date(0);
      let endDate: Date = sectionDates[sectionDates.length - 1];

      for (const currentDateSection of sectionDates) {
        if (taskAttempt.dateToCheckTask.getTime() < currentDateSection.getTime()) {
          endDate = currentDateSection;
          break;
        }
        if (sectionDates.indexOf(currentDateSection) < sectionDates.length - 1) {
          startDate = currentDateSection;
        }
      }

      const currentSection: DashboardDateSection = ((): DashboardDateSection => {
        const currentSection = this.dashboardDateSections.find(val => val.endDate.getTime() === endDate.getTime());
        if (currentSection) {
          return currentSection;
        }
        const isToday = endDate === currentDate;
        const newSection: DashboardDateSection = {
          startDate: startDate,
          endDate: endDate,
          isToday: isToday,
          isOpen: true,
          openClose: function () {
            this.isOpen = !this.isOpen;
          },
          providingEducations: [],
          getDashboardAttempts: function () {
            return this.providingEducations;
          },
          carouselId: "DateSection-" + ((isToday) ? "today" : String(endDate.getTime())),
          carouselType: dashboardCarouselTypes.section
        };
        this.dashboardDateSections.push(newSection);
        return newSection;
      })();

      const providingEducationSectionElement: DashboardProvidingEducationSectionElement = ((): DashboardProvidingEducationSectionElement => {

        let currentProvidingEducationAttempts = currentSection.providingEducations.find(
          val => val.providingEducation === taskAttempt.providingEducation);
        if (currentProvidingEducationAttempts) {
          return currentProvidingEducationAttempts;
        }
        const newAttempts: DashboardProvidingEducationSectionElement = {
          providingEducation: taskAttempt.providingEducation,
          name: taskAttempt.eduTemplateName,
          taskAttempts: [],
          tasks: [],
          carouselId: "ProvidingEducationSectionElement-" + taskAttempt.providingEducation + "-" + currentSection.carouselId,
          carouselType: dashboardCarouselTypes.sectionElement
        }
        currentSection.providingEducations.push(newAttempts);
        return newAttempts;

      })();

      const taskSection: DashboardTaskSectionElement = ((): DashboardTaskSectionElement => {
        const currentSection = providingEducationSectionElement.tasks.find(val => val.task === taskAttempt.task);
        if (currentSection) {
          return currentSection;
        }
        const newSection: DashboardTaskSectionElement = {
          task: taskAttempt.task,
          name: taskAttempt.name,
          taskAttempts: [],
          carouselId: "DateTaskSectionElement-" + taskAttempt.task + "-" + providingEducationSectionElement.carouselId,
          carouselType: dashboardCarouselTypes.sectionElement
        };
        providingEducationSectionElement.tasks.push(newSection);
        return newSection;
      })();

      taskSection.taskAttempts.push(this.taskAttempts.indexOf(taskAttempt));

    }

    for (const section of this.dashboardDateSections) {

      StringsTools.SortArrayByString(section.providingEducations, val => val.name);

      const dateSectionCarousel: DashboardCarousel = {
        type: section.carouselType,
        id: section.carouselId,
        openFunction: (arg: DashboardDateSection, startIndex: number) => {
          this.openDashboardSection(arg, startIndex);
        },
        openFunctionArg: section,
      }

      this.carousels.push(dateSectionCarousel);

      for (const taskSection of section.providingEducations) {

        StringsTools.SortArrayByString(taskSection.tasks, val => val.name);

        const sectionCarousel: DashboardCarousel = {
          type: taskSection.carouselType,
          id: taskSection.carouselId,
          openFunction: (arg: DashboardProvidingEducationSectionElement, startIndex: number) => {
            this.openDashboardSectionElement(arg, startIndex);
          },
          openFunctionArg: taskSection,
        }

        this.carousels.push(sectionCarousel);

        for (const sectionElement of taskSection.tasks) {

          StringsTools.SortArrayByString(sectionElement.taskAttempts, val => this.taskAttempts[val].user.name);

          const sectionCarousel: DashboardCarousel = {
            type: sectionElement.carouselType,
            id: sectionElement.carouselId,
            openFunction: (arg: DashboardTaskSectionElement, startIndex: number) => {
              this.openDashboardSectionElement(arg, startIndex);
            },
            openFunctionArg: sectionElement,
          }

          this.carousels.push(sectionCarousel);

          for (const taskAttempt of sectionElement.taskAttempts) {
            taskSection.taskAttempts.push(taskAttempt);
          }

        }
      }
    }

    if (environment.displayLog) {
      console.log("Tasks dashboard date sections:", this.dashboardDateSections);
    }

  }

  fillDashboardProvidingEducationSection() {

    this.dashboardProvidingEducationSections = [];

    for (const taskAttempt of this.taskAttempts) {

      const currentSection: DashboardProvidingEducationSection = ((): DashboardProvidingEducationSection => {
        const currentSection = this.dashboardProvidingEducationSections.find(val => val.providingEducation === taskAttempt.providingEducation);
        if (currentSection) {
          return currentSection;
        }
        const newSection: DashboardProvidingEducationSection = {
          providingEducation: taskAttempt.providingEducation,
          name: taskAttempt.eduTemplateName,
          tasks: [],
          isOpen: true,
          openClose: function () {
            this.isOpen = !this.isOpen;
          },
          getDashboardAttempts: function () {
            return this.tasks;
          },
          carouselId: "ProvidingEducationSection-" + taskAttempt.providingEducation,
          carouselType: dashboardCarouselTypes.section
        };
        this.dashboardProvidingEducationSections.push(newSection);
        return newSection;
      })();

      const taskAttempts: DashboardTaskSectionElement = ((): DashboardTaskSectionElement => {

        let taskAttempts = currentSection.tasks.find(
          val => val.task === taskAttempt.task);
        if (taskAttempts) {
          return taskAttempts;
        }
        const newAttempts: DashboardTaskSectionElement = {
          task: taskAttempt.task,
          name: taskAttempt.name,
          taskAttempts: [],
          carouselId: "TaskSectionElement-" + taskAttempt.task + "-" + currentSection.carouselId,
          carouselType: dashboardCarouselTypes.sectionElement
        }
        currentSection.tasks.push(newAttempts);
        return newAttempts;

      })();

      taskAttempts.taskAttempts.push(this.taskAttempts.indexOf(taskAttempt));

    }

    StringsTools.SortArrayByString(this.dashboardProvidingEducationSections, val => val.name);
    for (const section of this.dashboardProvidingEducationSections) {

      StringsTools.SortArrayByString(section.tasks, val => val.name);

      const sectionCarousel: DashboardCarousel = {
        type: section.carouselType,
        id: section.carouselId,
        openFunction: (arg: DashboardProvidingEducationSection, startIndex: number) => {
          this.openDashboardSection(arg, startIndex);
        },
        openFunctionArg: section,
      }

      this.carousels.push(sectionCarousel);

      for (const task of section.tasks) {

        StringsTools.SortArrayByString(task.taskAttempts, index => this.taskAttempts[index].user.name);

        const sectionCarousel: DashboardCarousel = {
          type: task.carouselType,
          id: task.carouselId,
          openFunction: (arg: DashboardTaskSectionElement, startIndex: number) => {
            this.openDashboardSectionElement(arg, startIndex);
          },
          openFunctionArg: task,
        }

        this.carousels.push(sectionCarousel);

      }
    }

    if (environment.displayLog) {
      console.log("Tasks dashboard providing education sections:", this.dashboardProvidingEducationSections);
    }

  }

  fillDashboardStudentsSection() {

    this.dashboardStudentsSections = [];

    for (const taskAttempt of this.taskAttempts) {
      const currentSection: DashboardStudentsSection = ((): DashboardStudentsSection => {
        const currentSection = this.dashboardStudentsSections.find(val => val.student.id === taskAttempt.user.id);
        if (currentSection) {
          return currentSection;
        }
        const newAttempts: DashboardSectionElement = {
          taskAttempts: [],
          carouselId: "SectionElement-" + taskAttempt.user.id,
          carouselType: dashboardCarouselTypes.sectionElement
        };
        const newSection: DashboardStudentsSection = {
          student: taskAttempt.user,
          isOpen: true,
          openClose: function () {
            this.isOpen = !this.isOpen;
          },
          attempts: newAttempts,
          getDashboardAttempts: function () {
            return [this.attempts];
          },
          carouselId: "StudentsSection-" + taskAttempt.user.id,
          carouselType: dashboardCarouselTypes.section
        };
        this.dashboardStudentsSections.push(newSection);
        return newSection;
      })();

      currentSection.attempts.taskAttempts.push(this.taskAttempts.indexOf(taskAttempt));

    }

    StringsTools.SortArrayByString(this.dashboardStudentsSections, val => val.student.name);

    for (const section of this.dashboardStudentsSections) {

      DatesTools.sortByDate<number>(
        section.attempts.taskAttempts, (index) => this.taskAttempts[index].dateToCheckTask, false, true);

      const sectionCarousel: DashboardCarousel = {
        type: section.carouselType,
        id: section.carouselId,
        openFunction: (arg: DashboardStudentsSection, startIndex: number) => {
          this.openDashboardSection(arg, startIndex);
        },
        openFunctionArg: section,
      }

      this.carousels.push(sectionCarousel);

    }


    if (environment.displayLog) {
      console.log("Tasks dashboard students sections:", this.dashboardStudentsSections);
    }

  }

  fillDashboardProvidingEducationPageSection() {

    this.dashboardProvidingEducationPageSections = [];

    for (const taskAttempt of this.taskAttempts) {

      const currentSection: DashboardProvidingEducationPageSection = ((): DashboardProvidingEducationPageSection => {
        const currentSection = this.dashboardProvidingEducationPageSections.find(
          val => val.task === taskAttempt.task);
        if (currentSection) {
          return currentSection;
        }
        const newAttempts: DashboardSectionElement = {
          taskAttempts: [],
          carouselId: "ProvidingEducationPageSectionElement-" + taskAttempt.task + "-" + taskAttempt.taskAttempt,
          carouselType: dashboardCarouselTypes.sectionElement
        };
        const newSection: DashboardProvidingEducationPageSection = {
          task: taskAttempt.task,
          name: taskAttempt.name,
          attempts: newAttempts,
          isOpen: true,
          openClose: function () {
            this.isOpen = !this.isOpen;
          },
          getDashboardAttempts: function () {
            return [this.attempts];
          },
          carouselId: "ProvidingEducationPageSection-" + taskAttempt.task,
          carouselType: dashboardCarouselTypes.section
        };
        this.dashboardProvidingEducationPageSections.push(newSection);
        return newSection;
      })();

      currentSection.attempts.taskAttempts.push(this.taskAttempts.indexOf(taskAttempt));

    }

    StringsTools.SortArrayByString(this.dashboardProvidingEducationPageSections, val => val.name);
    for (const section of this.dashboardProvidingEducationPageSections) {

      StringsTools.SortArrayByString(section.attempts.taskAttempts, val => this.taskAttempts[val].user.name);

      const sectionCarousel: DashboardCarousel = {
        type: section.carouselType,
        id: section.carouselId,
        openFunction: (arg: DashboardProvidingEducationPageSection, startIndex: number) => {
          this.openDashboardSection(arg, startIndex);
        },
        openFunctionArg: section,
      }

      this.carousels.push(sectionCarousel);

    }

    if (environment.displayLog) {
      console.log("Tasks dashboard providing education page sections:", this.dashboardProvidingEducationPageSections);
    }

  }

  // Навигация панели управления
  //

  selectDashboardMenu(variantName: DashboardVariant) {
    this.dashboardVariant = variantName;
    localStorage.setItem(this.dashboardVariantStorageName, String(this.dashboardVariant));
  }

  goToDashboard() {
    this.router.navigate(["/teaching", "tasks", "dashboard"]);
  }

  goToDashboardProvidingEducationPage(providingEducation: string) {
    this.router.navigate(["/teaching", "tasks", "dashboard", "providingEducation", providingEducation]);
  }

  goToDashboardProvidingEducationPageByPeriod(providingEducation: string, startDate: Date, endDate: Date) {
    this.router.navigate([
      "/teaching",
      "tasks",
      "dashboard",
      "providingEducation",
      providingEducation,
      "period",
      startDate.getTime(),
      endDate.getTime()
    ]);
  }

  goToDashboardProvidingEducationTaskPage(providingEducation: string, task: string) {
    this.router.navigate(["/teaching", "tasks", "dashboard",
      "providingEducation", providingEducation, "task", task]);
  }

  hideExpandAllSections(value: boolean): false {
    if (this.dashboardVariant === dashboardVariants.dates) {
      this.hideExpandSection(this.dashboardDateSections, value);
    }
    if (this.dashboardVariant === dashboardVariants.providingEducation) {
      this.hideExpandSection(this.dashboardProvidingEducationSections, value);
    }
    if (this.dashboardVariant === dashboardVariants.students) {
      this.hideExpandSection(this.dashboardStudentsSections, value);
    }
    return false;
  }

  hideExpandSection(sections: DashboardSection[], value: boolean) {
    for (const section of sections) {
      section.isOpen = value;
    }
  }

  isDashboardStartPage(): boolean {
    if (this.isDashboard) {
      if (this.dashboardProvidingEducation) {
        return false;
      }
      if (this.dashboardTask) {
        return false;
      }
      return true;
    }
    return false;
  }

  // Открытие карусели
  //

  checkCurrentPage(startIndex?: number): false {

    const attempts = this.currentPageAttempts();

    if (!attempts.length) {
      return;
    }

    this.saveOpenedCarousel(dashboardCarouselTypes.all, dashboardCarouselTypes.all, startIndex);
    this.openTaskAttemptByIndex(attempts, startIndex);
    return false;

  }

  openTaskAttempt(taskAttempt: EduStudentTaskAttempt): false {

    this.openedTaskAttempt = taskAttempt;
    this.openedTaskAttemptResLink = undefined;

    if (taskAttempt.isElectronicResource) {
      this.openedTaskAttemptResLink = {
        electronicCourse: this.openedTaskAttempt.electronicCourse,
        electronicResource: this.openedTaskAttempt.electronicResource,
        userActivity: this.openedTaskAttempt.userActivity,
        task: this.openedTaskAttempt.task,
        item: this.openedTaskAttempt.itemElectronicResource,
        user: this.openedTaskAttempt.user.id
      };
    }

    this.updateOpenedCarousel(taskAttempt);

    this.modalTaskToCheckManager.next(true);

    return false;

  }

  openTaskAttemptByIndex(attempts: EduStudentTaskAttempt[], startIndex: number): void {
    if (!attempts.length) {
      return;
    }
    startIndex = (startIndex && startIndex > -1 && attempts[startIndex]) ? startIndex : 0;
    this.openTaskAttempt(attempts[startIndex]);
  }

  openDashboardSection(dashboardSection: DashboardSection, startIndex?: number): false {
    this.openedDashboardSection = dashboardSection;
    const attempts = this.openedTaskAttempts();
    if (!attempts.length) {
      this.openedDashboardSection = undefined;
      return;
    }
    this.saveOpenedCarousel(dashboardSection.carouselId, dashboardSection.carouselType, startIndex);
    this.openTaskAttemptByIndex(attempts, startIndex);
    return false;
  }

  openDashboardSectionAttempt(dashboardSection: DashboardSection, taskAttempt: EduStudentTaskAttempt): false {
    const attempts = this.dashboardSectionAttempts(dashboardSection);
    if (!attempts.length) {
      return;
    }
    this.openDashboardSection(dashboardSection, attempts.indexOf(taskAttempt));
    return false;
  }

  openDashboardSectionElement(dashboardSectionElement: DashboardSectionElement, startIndex?: number): false {
    this.openedDashboardSectionElement = dashboardSectionElement;
    const attempts = this.openedTaskAttempts();
    if (!attempts.length) {
      this.openedDashboardSectionElement = undefined;
      return;
    }
    this.saveOpenedCarousel(dashboardSectionElement.carouselId, dashboardSectionElement.carouselType, startIndex);
    this.openTaskAttemptByIndex(attempts, startIndex);
    return false;
  }

  openPostpone(startIndex?: number): false {
    if (!this.postponeTaskAttempts.length) {
      return;
    }
    this.isPostponeOpened = true;
    this.saveOpenedCarousel(dashboardCarouselTypes.postpone, dashboardCarouselTypes.postpone, startIndex);
    this.openTaskAttemptByIndex(this.postponeTaskAttempts, startIndex);
    return false;
  }

  openPostponeTaskAttempt(taskAttempt: EduStudentTaskAttempt): false {
    this.openPostpone(this.postponeTaskAttempts.indexOf(taskAttempt));
    return false;
  }

  openedTaskAttempts(): EduStudentTaskAttempt[] {

    let attempts: EduStudentTaskAttempt[] = this.currentPageAttempts();

    if (this.openedDashboardSectionElement) {
      attempts = this.dashboardAttempts([this.openedDashboardSectionElement]);
    }
    if (this.openedDashboardSection) {
      attempts = this.dashboardSectionAttempts(this.openedDashboardSection);
    }
    if (this.isPostponeOpened) {
      attempts = this.postponeTaskAttempts;
    }
    return attempts;

  }

  clearOpenedCarousel() {
    this.openedCarousel = undefined;
    localStorage.removeItem(this.dashboardCarouselStorageName);
  }

  updateOpenedCarousel(taskAttempt: EduStudentTaskAttempt) {
    if (!this.openedCarousel || !taskAttempt) {
      return;
    }
    const attempts = this.openedTaskAttempts();
    const attemptIndex = attempts.indexOf(taskAttempt);
    this.saveOpenedCarousel(this.openedCarousel.id, this.openedCarousel.type, attemptIndex);
  }

  saveOpenedCarousel(id: string, type: DashboardCarouselType, startIndex: number) {
    this.openedCarousel = this.getCarousel(id, type);
    const currentCarouselData: DashboardCurrentCarousel = {
      id: this.openedCarousel.id,
      type: this.openedCarousel.type,
      startIndex: startIndex,
    };
    localStorage.setItem(this.dashboardCarouselStorageName, JSON.stringify(currentCarouselData))
  }

  getCarouselFromLocalStorage(): DashboardCurrentCarousel {
    const stringData = localStorage.getItem(this.dashboardCarouselStorageName);
    if (!stringData) {
      return undefined;
    }
    return JSON.parse(stringData);
  }

  getCarousel(id: string, type: DashboardCarouselType): DashboardCarousel {
    let carousel = this.carousels.find(val => val.id === id && val.type === type);
    if (!carousel) {
      this.err.register(`Carousel ${type}/${id} not found`);
      carousel = this.carousels.find(val => val.type = dashboardCarouselTypes.all);
    }
    return carousel;
  }

  openCarouselFromLocalStorage(carouselFromLocalStorage: DashboardCurrentCarousel) {
    if (!carouselFromLocalStorage) {
      return;
    }
    const carousel = this.getCarousel(carouselFromLocalStorage.id, carouselFromLocalStorage.type);
    carousel.openFunction(carousel.openFunctionArg, carouselFromLocalStorage.startIndex);
  }

  clearOpenedData() {
    this.openedTaskAttempt = undefined;
    this.openedTaskAttemptResLink = undefined;
    this.openedDashboardSectionElement = undefined;
    this.openedDashboardSection = undefined;
    this.dashboardDateSections = [];
    this.dashboardProvidingEducationSections = [];
    this.dashboardStudentsSections = [];
    this.dashboardProvidingEducationPageSections = [];
    this.isPostponeOpened = false;
  }

  // Навигация карусели
  //

  getNext(): EduStudentTaskAttempt {
    const openedTaskAttempts = this.openedTaskAttempts();
    if (!openedTaskAttempts.length) {
      return undefined;
    }
    const startIndex = (this.openedTaskAttempt)
      ? openedTaskAttempts.findIndex(val => val.taskAttempt === this.openedTaskAttempt.taskAttempt) : 0;
    const allToRight = openedTaskAttempts.filter((val, index) => index > startIndex);
    return (allToRight.length) ? allToRight[0] : null;
  }

  getPrevious(): EduStudentTaskAttempt {
    const openedTaskAttempts = this.openedTaskAttempts();
    if (!openedTaskAttempts.length) {
      return undefined;
    }
    const startIndex = (this.openedTaskAttempt)
      ? openedTaskAttempts.findIndex(val => val.taskAttempt === this.openedTaskAttempt.taskAttempt) : 0;
    const allToLeft = openedTaskAttempts.filter((val, index) => index < startIndex);
    return (allToLeft.length) ? allToLeft[allToLeft.length - 1] : null;
  }

  openNext() {
    const next = this.getNext();
    if (next) {
      this.openTaskAttempt(next);
    }
  }

  openPrevious() {
    const previous = this.getPrevious();
    if (previous) {
      this.openTaskAttempt(previous);
    }
  }

  updateTaskAttempt(taskAttempt: EduStudentTaskAttempt) {

    if (environment.displayLog) {
      console.log("Update task attempt in the list:", taskAttempt);
    }

    const taskIndex = this.taskAttempts.findIndex(val => val.taskAttempt === taskAttempt.taskAttempt);
    if (taskIndex > -1) {
      this.taskAttempts[taskIndex] = taskAttempt;
    }

  }

  // Получение попыток
  //

  currentPageAttempts(): EduStudentTaskAttempt[] {

    let sections: DashboardSection[] = [];

    if (this.dashboardProvidingEducation) {
      sections = this.dashboardProvidingEducationPageSections;
    }

    if (this.isDashboardStartPage()) {
      if (this.dashboardVariant === dashboardVariants.dates) {
        sections = this.dashboardDateSections;
      }
      if (this.dashboardVariant === dashboardVariants.providingEducation) {
        sections = this.dashboardProvidingEducationSections;
      }
      if (this.dashboardVariant === dashboardVariants.students) {
        sections = this.dashboardStudentsSections;
      }
    }

    return (sections.length) ? this.dashboardSectionsAttempts(sections) : this.taskAttempts;

  }

  dashboardSectionsAttempts(dashboardSections: DashboardSection[]): EduStudentTaskAttempt[] {
    let allAttempts: EduStudentTaskAttempt[] = [];
    for (const section of dashboardSections) {
      allAttempts = allAttempts.concat(this.dashboardSectionAttempts(section));
    }
    return allAttempts;
  }

  dashboardSectionAttempts(section: DashboardSection): EduStudentTaskAttempt[] {
    return this.dashboardAttempts(section.getDashboardAttempts());
  }

  dashboardAttempts(dashboardAttempts: DashboardSectionElement[]): EduStudentTaskAttempt[] {
    let allAttempts: number[] = [];
    for (const element of dashboardAttempts) {
      allAttempts = allAttempts.concat(element.taskAttempts);
    }
    return this.taskAttemptsByIndex(allAttempts);
  }

  taskAttemptsByIndex(indexes: number[]): EduStudentTaskAttempt[] {
    const attempts: EduStudentTaskAttempt[] = [];
    for (const index of indexes) {
      if (this.taskAttempts[index]) {
        attempts.push(this.taskAttempts[index]);
      } else {
        this.err.register(`Index ${index} not found in this.taskAttempts array`);
      }
    }
    return attempts;
  }

  // Вспомогательное
  //

  currentDate(): Date {
    return new Date();
  }

}
