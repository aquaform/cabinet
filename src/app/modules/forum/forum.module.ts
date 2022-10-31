import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForumTopicComponent } from './forum-topic/forum-topic.component';
import { ForumListComponent } from './forum-list/forum-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { ResourcesModule } from '@modules/resources/resources.module';
import { FormsModule } from '@angular/forms';
import { UserModule } from '@modules/user/user.module';
import { LoaderModule } from '@modules/root/loader/loader.module';
import { UploadModule } from '@modules/root/upload/upload.module';
import { DatesModule } from '@modules/root/dates/dates.module';
import { InnerHTMLModule } from '@modules/root/inner-html/inner-html.module';
import { IconModule } from '@modules/root/icon/icon.module';
import { ForumNewMessageComponent } from './forum-new-message/forum-new-message.component';
import { ForumMessageComponent } from './forum-message/forum-message.component';
import { ModalModule } from '@modules/root/modal/modal.module';
import { EditorModule } from '@modules/root/editor/editor.module';


@NgModule({
  declarations: [
    ForumTopicComponent,
    ForumListComponent,
    ForumNewMessageComponent,
    ForumMessageComponent
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
    ModalModule,
    EditorModule
  ],
  exports: [
    ForumTopicComponent,
    ForumListComponent,
    ForumNewMessageComponent,
  ]
})
export class ForumModule { }
