import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RootModule } from '@modules/root/root.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import {MultiTranslateHttpLoader} from "ngx-translate-multi-http-loader";
import { translationResourcesExtended } from '@pages/extended-pages.interface';
import { MyPageComponent } from './my-page.component';
import { MyPageComponentRoutingModule } from './my-page-routing.module';


export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    {prefix: "./assets/i18n/modules/root/", suffix: ".json"},
    ...translationResourcesExtended,
  ]);
}

@NgModule({
  declarations: [MyPageComponent],
  imports: [
    CommonModule,
    RouterModule,
    MyPageComponentRoutingModule,
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
  ]
})
export class MyPageModule { }
