import { Injectable } from '@angular/core';
import { ModalService } from '@modules/root/modal/modal.service';
import { BookData } from './book.interface';
import { modalComponentNames } from '@modules/root/modal/modal.interface';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(
    private modal: ModalService,
  ) { }

  Open(data: BookData) {
    this.modal.Display({
      component: modalComponentNames.book,
      data: data,
      maximizeSize: false
    });
  }

  Close() {
    this.modal.Close();
  }

}
