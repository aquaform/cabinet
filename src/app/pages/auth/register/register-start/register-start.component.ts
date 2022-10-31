import { Component, OnInit, Input } from '@angular/core';
import { RegisterFormData, registerFormPages } from '../register.component';

@Component({
  selector: 'app-register-start',
  templateUrl: './register-start.component.html',
  styleUrls: ['./register-start.component.scss']
})
export class RegisterStartComponent implements OnInit {

  @Input() formData: RegisterFormData;

  constructor() { }

  ngOnInit() {
  }

  startRegister() {
    if (this.formData.settings.usePinCode) {
      this.formData.currentPage = registerFormPages.pin;
    } else {
      this.formData.submit();
    }
  }

}
