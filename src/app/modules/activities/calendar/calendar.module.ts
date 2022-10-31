import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from './calendar/calendar.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { RootModule } from '@modules/root/root.module';
import { StudentModule } from '../student/student.module';


@NgModule({
  declarations: [CalendarComponent],
  imports: [
    CommonModule,
    FullCalendarModule,
    TranslateModule,
    RouterModule,
    RootModule,
    StudentModule
  ],
  exports: [
    CalendarComponent
  ]
})
export class CalendarModule { }
