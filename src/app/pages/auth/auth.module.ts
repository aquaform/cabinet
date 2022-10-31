import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthRoutingModule } from './auth-routing.module';
import { RecoveryComponent } from './recovery/recovery.component';
import { FormsModule } from "@angular/forms";
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MultiTranslateHttpLoader } from "ngx-translate-multi-http-loader";
import { RootModule } from '@modules/root/root.module';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { RegisterStartComponent } from './register/register-start/register-start.component';
import { RegisterFinalComponent } from './register/register-final/register-final.component';
import { PinCodesModule } from '@modules/pin-codes/pin-codes.module';
import { translationResourcesExtended } from '@pages/extended-pages.interface';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: "./assets/i18n/modules/auth/", suffix: ".json" },
    { prefix: "./assets/i18n/modules/root/", suffix: ".json" },
    ...translationResourcesExtended,
  ]);
}

@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent,
    RegisterComponent,
    RecoveryComponent,
    ChangePasswordComponent,
    RegisterStartComponent,
    RegisterFinalComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
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
    PinCodesModule
  ],
  exports: [AuthComponent],
})
export class AuthModule { }
