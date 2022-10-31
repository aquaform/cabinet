import { Injectable } from '@angular/core';
import { ModalService } from '@modules/root/modal/modal.service';
import { UserCardInputData } from './user.interface';
import { modalComponentNames } from '@modules/root/modal/modal.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private modal: ModalService) { }

  public Open(id: string, name: string): void {
    const data: UserCardInputData = {
      id: id,
      name: name
    };
    this.modal.Display({
      component: modalComponentNames.user,
      data: data,
      maximizeSize: false
    });
  }

  public Close(): void {
    this.modal.Close();
  }

}
