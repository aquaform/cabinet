import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthComponent } from './auth.component';
import { RegisterComponent } from './register/register.component';
import { RecoveryComponent } from './recovery/recovery.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

const routes: Routes = [
  {
    path: "", component: AuthComponent, children: [
      { path: "login", component: LoginComponent },
      { path: "login/:login", component: LoginComponent },
      { path: "login/:login/:password", component: LoginComponent },
      { path: "loginBase64/:base64", component: LoginComponent },
      { path: "loginByUUID/:userUUID/:keyHash", component: LoginComponent },
      { path: "register", component: RegisterComponent },
      { path: "recovery", component: RecoveryComponent },
      { path: "changePassword/:id/:code", component: ChangePasswordComponent },
      { path: ":id/:code", component: ChangePasswordComponent }, // Для совместимости с ссылкой ВК 2.0
      { path: "**", component: LoginComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
