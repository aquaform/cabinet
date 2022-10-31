import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeachingComponent } from './teaching.component';
import { TeachingRoutingModule } from './teaching-routing.module';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {MultiTranslateHttpLoader} from "ngx-translate-multi-http-loader";
import { TeacherModule } from '@modules/activities/teacher/teacher.module';
import { ActivityComponent } from './activity/activity.component';
import { ActivitiesComponent } from './activities/activities.component';
import { RootModule } from '@modules/root/root.module';
import { ReportsModule } from '@modules/activities/reports/reports.module';
import { TasksComponent } from './tasks/tasks.component';
import { translationResourcesExtended } from '@pages/extended-pages.interface';


export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    {prefix: "./assets/i18n/modules/root/", suffix: ".json"},
    {prefix: "./assets/i18n/modules/teacher/", suffix: ".json"},
    ...translationResourcesExtended
  ]);
}

@NgModule({
  declarations: [TeachingComponent, ActivityComponent, ActivitiesComponent, TasksComponent],
  imports: [
    CommonModule,
    TeachingRoutingModule,
    RouterModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
      isolate: true
    }),
    HttpClientModule,
    RootModule,
    TeacherModule,
    ReportsModule
  ]
})
export class TeachingModule { }
