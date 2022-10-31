import { Injectable } from '@angular/core';
import { AlertMessage } from "./alert.interface";
import { ModalService } from '../modal/modal.service';
import { modalComponentNames } from '../modal/modal.interface';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private modal: ModalService) { }

  Open(data: AlertMessage) {
    this.modal.Display({
      component: modalComponentNames.alert,
      data: data,
      maximizeSize: false,
      reloadAfterClose: !!data.reloadAfterClose
    });
  }

  Close() {
    this.modal.Close();
  }

}
