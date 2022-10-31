import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Injectable, ErrorHandler } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RootModule } from './modules/root/root.module';
import { MultiTranslateHttpLoader } from "ngx-translate-multi-http-loader";
import { QuillModule } from 'ngx-quill';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { translationResourcesExtended } from '@pages/extended-pages.interface';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: "./assets/i18n/modules/root/", suffix: ".json" },
    ...translationResourcesExtended,
  ]);
}

@Injectable()
export class AppErrorHandler implements ErrorHandler {
    constructor(private err: ErrorsService) {
    }
    handleError(error: any) {
        this.err.register(error);
    }
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    RootModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
      isolate: true
    }),
    HttpClientModule,
    QuillModule.forRoot({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered'}, { list: 'bullet' }],
          [{ color: [] }, { background: [] }],
        ]
      }
    })
  ],
  providers: [{ provide: ErrorHandler, useClass: AppErrorHandler }],
  bootstrap: [AppComponent]
})
export class AppModule { }
