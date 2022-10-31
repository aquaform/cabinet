import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal/modal.component';
import { ModalDirective } from './modal.directive';
import { AlertModule } from '../alert/alert.module';
import { QuestionModule } from '../question/question.module';
import { UserModule } from '@modules/user/user.module';
import { ResourcesModule } from '@modules/resources/resources.module';
import { CustomModalComponent } from './custom-modal/custom-modal.component';
import { MessagesModule } from '@modules/messages/messages.module';
import { IconModule } from '../icon/icon.module';

@NgModule({
  declarations: [ModalComponent, ModalDirective, CustomModalComponent],
  imports: [
    CommonModule,
    ResourcesModule,
    AlertModule,
    QuestionModule,
    UserModule,
    MessagesModule,
    IconModule
  ],
  exports: [
    ModalComponent,
    CustomModalComponent
  ]
})
export class ModalModule { }
