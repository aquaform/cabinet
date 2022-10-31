import { Component, ComponentFactoryResolver, HostBinding, ViewChild, Type } from '@angular/core';
import { ModalService } from '../modal.service';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';
import { ModalItem } from '../modal.interface';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { ModalDirective } from '../modal.directive';
import { BookComponent } from '@modules/resources/book/book/book.component';
import { AlertComponent } from '@modules/root/alert/alert/alert.component';
import { QuestionComponent } from '@modules/root/question/question/question.component';
import { FileWindowComponent } from '@modules/resources/file/file-window/file-window.component';
import { UserCardComponent } from '@modules/user/user-card/user-card.component';
import { MessagesNewComponent } from '@modules/messages/messages-new/messages-new.component';

export const modalComponents = {
  book: BookComponent,
  file: FileWindowComponent,
  alert: AlertComponent,
  question: QuestionComponent,
  user: UserCardComponent,
  message: MessagesNewComponent
};

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent extends AppComponentTemplate {

  @HostBinding("class.visibility") visibility = false;
  @ViewChild(ModalDirective, {static: true}) modalHost: ModalDirective;
  item: ModalItem;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private modal: ModalService,
    private err: ErrorsService) {

    super();

  }

  ngOnInit() {
    this.modal.OnChangeVisibility$
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(
      (item) => {
        this.item = item;
        this.visibility = !!this.item;
        // Examples:
        // https://angular.io/guide/dynamic-component-loader
        // https://stackblitz.com/angular/qkjgxnpglxyl?file=src%2Fapp%2Fad-banner.component.ts
        const viewContainerRef = this.modalHost.viewContainerRef;
        viewContainerRef.clear();
        if (this.visibility) {
          const component = modalComponents[item.component] as Type<any>;
          const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
          const componentRef = viewContainerRef.createComponent(componentFactory);
          (componentRef.instance as any).data = item.data;
        }
      },
      (err) => this.err.register(err)
    );
  }

}
