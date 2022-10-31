import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { authIcons } from '@pages/auth/auth.icons';
import { PinCodeFormData } from '../pin-codes.interface';

@Component({
  selector: 'app-register-pin',
  templateUrl: './register-pin.component.html',
  styleUrls: ['./register-pin.component.scss']
})
export class RegisterPinComponent implements OnInit {

  @Input() formData: PinCodeFormData;
  @Input() displayBackButton: boolean;
  @Input() label: string;

  @Output() submitPin = new EventEmitter<void>();
  @Output() doBack = new EventEmitter<void>();

  authIcons = authIcons;

  constructor() { }

  ngOnInit() {
  }

  sendPin() {
    this.submitPin.emit();
  }

  back() {
    this.doBack.emit();
  }

}
