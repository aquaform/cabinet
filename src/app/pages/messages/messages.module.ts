import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagesComponent } from './messages.component';
import { MessagesRoutingModule } from './messages-routing.module';
import { RootModule } from '@modules/root/root.module';
import { MessagesModule } from '@modules/messages/messages.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { translationResourcesExtended } from '@pages/extended-pages.interface';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    {prefix: "./assets/i18n/modules/root/", suffix: ".json"},
    {prefix: "./assets/i18n/modules/messages/", suffix: ".json"},
    ...translationResourcesExtended,
  ]);
}

@NgModule({
  declarations: [MessagesComponent],
  imports: [
    CommonModule,
    MessagesRoutingModule,
    RootModule,
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
    MessagesModule,

  ]
})
export class MessagesPageModule { }
