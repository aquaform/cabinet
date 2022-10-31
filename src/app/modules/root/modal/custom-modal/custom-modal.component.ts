import { Component, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { AppComponentTemplate } from '@shared/component.template';
import { UserDescription } from '@modules/user/user.interface';

const selectorName = 'app-custom-modal';

@Component({
  selector: selectorName,
  templateUrl: './custom-modal.component.html',
  styleUrls: ['./custom-modal.component.scss']
})
export class CustomModalComponent extends AppComponentTemplate {

  @Input() maximize = false;
  @Input() wide = false;
  @Input() user: UserDescription;
  @Input() title: string;
  @Input() manager: BehaviorSubject<boolean> | ReplaySubject<boolean>;
  @Input() closeByHost = true;

  @Input() displayArrows = false;
  @Input() displayNext = false;
  @Input() displayPrevious = false;
  @Output() clickNext = new EventEmitter<void>();
  @Output() clickPrevious = new EventEmitter<void>();

  startClickTarget: EventTarget;

  constructor() {
    super();
  }

  ngOnInit() {

  }

  @HostListener("mousedown", ['$event'])
  mousedown(event: MouseEvent) {
    // Если элемент, где начали нажатие не совпадет
    // с тем, на котором его завершили, то такое событие обрабатывать не следует.
    this.startClickTarget = event.target;
  }

  @HostListener("click", ['$event'])
  hostClick(event: MouseEvent) {
    if (this.closeByHost && this.startClickTarget === event.target
      && event.target instanceof Element && event.target.localName === selectorName) {
      this.close();
    }
  }

  close(): false {
    this.manager.next(false);
    return false;
  }

  next() {
    this.clickNext.next();
  }

  previous() {
    this.clickPrevious.next();
  }

}
