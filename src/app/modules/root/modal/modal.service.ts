import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModalItem } from './modal.interface';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private onChangeVisibility$: BehaviorSubject<ModalItem> = new BehaviorSubject<ModalItem>(null);
  OnChangeVisibility$ = this.onChangeVisibility$.asObservable();

  private reloadAfterClose = false;

  constructor() {}

  Display(item: ModalItem): void {
    this.reloadAfterClose = !!item.reloadAfterClose;
    this.onChangeVisibility$.next(item);
  }

  Close(): void {
    if (this.reloadAfterClose) {
      location.reload();
    }
    this.onChangeVisibility$.next(null);
  }

}
