import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatesTools } from '@modules/root/dates/dates.class';
import { TranslateService } from '@ngx-translate/core';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent extends AppComponentTemplate {

  providingEducation: string;
  task: string;
  title: string;
  startPeriod: number;
  endPeriod: number;

  providingEducationName: string;
  taskName: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        this.providingEducation = params.providingEducation;
        this.task = params.task;
        this.startPeriod = (params.startPeriod) ? Number(params.startPeriod) : 0;
        this.endPeriod = (params.endPeriod) ? Number(params.endPeriod) : 0;
        this.updateTitle();
      });
  }

  updateTitle(title?: string) {
    this.title = "";
    if (!this.providingEducation) {
      this.providingEducationName = "";
    }
    if (!this.taskName) {
      this.taskName = "";
    }
    if (this.taskName) {
      this.title = this.taskName;
    } else if (this.providingEducationName) {
      this.title = this.providingEducationName;
    } else {
      this.translate.get("TEACHER_TASKS.TITLE")
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(val => this.title = val);
    }
  }

  updateProvidingEducationName(name: string) {
    this.providingEducationName = name;
    this.updateTitle();
  }

  updateTaskName(name: string) {
    this.taskName = name;
    this.updateTitle();
  }

  numberToDate(n: number): Date {
    return new Date(n);
  }

  currentDate(): Date {
    return new Date();
  }

  isToday(date: number): boolean {
    return DatesTools.startDay(this.currentDate()).getTime() === DatesTools.startDay(new Date(date)).getTime();
  }

}
