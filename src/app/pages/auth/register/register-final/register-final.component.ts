import { Component, OnInit, Input } from '@angular/core';
import { RegisterFormData } from '../register.component';
import { Router } from '@angular/router';
import { LoginFormData } from '@pages/auth/login/login.component';
import { authIcons } from '@pages/auth/auth.icons';

@Component({
  selector: 'app-register-final',
  templateUrl: './register-final.component.html',
  styleUrls: ['./register-final.component.scss']
})
export class RegisterFinalComponent implements OnInit {

  @Input() formData: RegisterFormData;
  loginFormData: LoginFormData = {
    login: "",
    password: "",
    passwordHash: "",
    userUUID: ""
  };

  authIcons = authIcons;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    const passwordField = this.formData.fieldsData.find((val) => val.field.id === "Password" || val.field.id === "password");
    if (passwordField) {
      this.loginFormData.login = this.formData.login;
      this.loginFormData.password = passwordField.value;
    } else {
      this.router.navigate(['/auth']);
    }
  }

}
