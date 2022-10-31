import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { MoreComponent } from './more.component';
import { MoreRoutingModule } from './more-routing.module';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { RootModule } from '@modules/root/root.module';
import { translationResourcesExtended } from '@pages/extended-pages.interface';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    {prefix: "./assets/i18n/modules/root/", suffix: ".json"},
    ...translationResourcesExtended,
  ]);
}

@NgModule({
  declarations: [MoreComponent],
  imports: [
    CommonModule,
    MoreRoutingModule,
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
  ]
})
export class MoreModule { }
