import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursePageComponent } from './course.component';
import { RootModule } from '@modules/root/root.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from "ngx-translate-multi-http-loader";
import { CourseRoutingModule } from './course-routing.module';
import { CoursesModule } from '@modules/courses/courses.module';
import { translationResourcesExtended } from '@pages/extended-pages.interface';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    {prefix: "./assets/i18n/modules/root/", suffix: ".json"},
    {prefix: "./assets/i18n/modules/course/", suffix: ".json" },
    ...translationResourcesExtended,
  ]);
}

@NgModule({
  declarations: [CoursePageComponent],
  imports: [
    CommonModule,
    CourseRoutingModule,
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
    CoursesModule
  ]
})
export class CoursePageModule { }
