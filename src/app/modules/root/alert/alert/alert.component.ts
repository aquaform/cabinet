import { Component, Input } from '@angular/core';
import { AlertService } from '../alert.service';
import { AppComponentTemplate } from '@shared/component.template';
import { AlertMessage } from '../alert.interface';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent extends AppComponentTemplate {

  @Input() data: AlertMessage = {
    text: "",
    title: ""
  };

  constructor(private alert: AlertService) {
    super();
  }

  ngOnInit() {
  }

  close() {
    this.alert.Close();
  }

}
