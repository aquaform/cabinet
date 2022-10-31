import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagesListComponent } from './messages-list/messages-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { ResourcesModule } from '@modules/resources/resources.module';
import { MessagesContactsComponent } from './messages-contacts/messages-contacts.component';
import { MessagesTopicComponent } from './messages-topic/messages-topic.component';
import { FormsModule } from '@angular/forms';
import { UserModule } from '@modules/user/user.module';
import { MessagesNewComponent } from './messages-new/messages-new.component';
import { LoaderModule } from '@modules/root/loader/loader.module';
import { UploadModule } from '@modules/root/upload/upload.module';
import { DatesModule } from '@modules/root/dates/dates.module';
import { InnerHTMLModule } from '@modules/root/inner-html/inner-html.module';
import { IconModule } from '@modules/root/icon/icon.module';
import { EditorModule } from '@modules/root/editor/editor.module';


@NgModule({
  declarations: [
    MessagesListComponent,
    MessagesContactsComponent,
    MessagesTopicComponent,
    MessagesNewComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    ResourcesModule,
    FormsModule,
    UserModule,
    LoaderModule,
    UploadModule,
    DatesModule,
    InnerHTMLModule,
    IconModule,
    EditorModule
  ],
  exports: [
    MessagesListComponent,
    MessagesContactsComponent,
    MessagesTopicComponent,
    MessagesNewComponent
  ]
})
export class MessagesModule { }
