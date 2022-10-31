import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EducationComponent } from './education.component';
import { EducationRoutingModule } from './education-routing.module';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from "ngx-translate-multi-http-loader";
import { StudentModule } from '@modules/activities/student/student.module';
import { ActivitiesComponent } from './activities/activities.component';
import { ActivityComponent } from './activity/activity.component';
import { RootModule } from '@modules/root/root.module';
import { TaskComponent } from './task/task.component';
import { translationResourcesExtended } from '@pages/extended-pages.interface';


export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: "./assets/i18n/modules/root/", suffix: ".json" },
    { prefix: "./assets/i18n/modules/student/", suffix: ".json" },
    ...translationResourcesExtended,
  ]);
}


@NgModule({
  declarations: [
    EducationComponent,
    ActivitiesComponent,
    ActivityComponent,
    TaskComponent
  ],
  imports: [
    CommonModule,
    EducationRoutingModule,
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
    StudentModule
  ]
})
export class EducationModule { }
