import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StartRoutingModule } from './start-routing.module';
import { StartComponent } from './start.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {MultiTranslateHttpLoader} from "ngx-translate-multi-http-loader";
import { StudentModule } from '@modules/activities/student/student.module';
import { RootModule } from '@modules/root/root.module';
import { NewsModule } from '@modules/news/news.module';
import { TeacherModule } from '@modules/activities/teacher/teacher.module';
import { PinCodesModule } from '@modules/pin-codes/pin-codes.module';
import { translationResourcesExtended } from '@pages/extended-pages.interface';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    {prefix: "./assets/i18n/modules/root/", suffix: ".json"},
    {prefix: "./assets/i18n/modules/student/", suffix: ".json"},
    {prefix: "./assets/i18n/modules/teacher/", suffix: ".json"},
    {prefix: "./assets/i18n/modules/news/", suffix: ".json"},
    ...translationResourcesExtended,
  ]);
}


@NgModule({
  declarations: [StartComponent],
  imports: [
    CommonModule,
    RouterModule,
    StartRoutingModule,
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
    StudentModule,
    NewsModule,
    TeacherModule,
    PinCodesModule
  ]
})
export class StartModule { }
