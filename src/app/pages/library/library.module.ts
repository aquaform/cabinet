import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryComponent } from './library.component';
import { LibraryRoutingModule } from './library-routing.module';
import { RouterModule } from '@angular/router';
import { RootModule } from '@modules/root/root.module';
import { LibraryModule } from '@modules/library/library.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import {MultiTranslateHttpLoader} from "ngx-translate-multi-http-loader";
import { translationResourcesExtended } from '@pages/extended-pages.interface';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    {prefix: "./assets/i18n/modules/root/", suffix: ".json"},
    {prefix: "./assets/i18n/modules/library/", suffix: ".json"},
    ...translationResourcesExtended,
  ]);
}

@NgModule({
  declarations: [LibraryComponent],
  imports: [
    CommonModule,
    RouterModule,
    LibraryRoutingModule,
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
    LibraryModule
  ]
})
export class LibraryPageModule { }
