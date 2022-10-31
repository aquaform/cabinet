import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarPageComponent } from './calendar.component';
import { CalendarRoutingModule } from './calendar-routing.module';
import { RootModule } from '@modules/root/root.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {MultiTranslateHttpLoader} from "ngx-translate-multi-http-loader";
import { CalendarModule } from '@modules/activities/calendar/calendar.module';
import { translationResourcesExtended } from '@pages/extended-pages.interface';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    {prefix: "./assets/i18n/modules/root/", suffix: ".json"},
    {prefix: "./assets/i18n/modules/student/", suffix: ".json" },
    ...translationResourcesExtended,
  ]);
}

@NgModule({
  declarations: [CalendarPageComponent],
  imports: [
    CommonModule,
    CalendarRoutingModule,
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
    CalendarModule
  ]
})
export class CalendarPageModule { }
