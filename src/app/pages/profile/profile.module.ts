import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { RootModule } from '@modules/root/root.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {MultiTranslateHttpLoader} from "ngx-translate-multi-http-loader";
import { translationResourcesExtended } from '@pages/extended-pages.interface';


export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    {prefix: "./assets/i18n/modules/root/", suffix: ".json"},
    {prefix: "./assets/i18n/modules/profile/", suffix: ".json"},
    ...translationResourcesExtended,
  ]);
}

@NgModule({
  declarations: [ProfileComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule,
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
    AuthModule,
    ProfileModule
  ]
})
export class ProfilePageModule { }
