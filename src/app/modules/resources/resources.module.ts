import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlModule } from '@modules/root/location/safe-url.module';
import { FileWindowComponent } from './file/file-window/file-window.component';
import { BookComponent } from './book/book/book.component';
import { ResourcesListElementComponent } from './list/resources-list-element/resources-list-element.component';
import { IconModule } from '@modules/root/icon/icon.module';
import { LoaderModule } from '@modules/root/loader/loader.module';
import { UploadModule } from '@modules/root/upload/upload.module';
import { DatesModule } from '@modules/root/dates/dates.module';
import { FolderListElementComponent } from './list/folder-list-element/folder-list-element.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [FileWindowComponent, BookComponent, ResourcesListElementComponent, FolderListElementComponent],
  imports: [
    CommonModule,
    SafeUrlModule,
    IconModule,
    LoaderModule,
    UploadModule,
    DatesModule,
    TranslateModule
  ],
  exports: [
    FileWindowComponent,
    BookComponent,
    ResourcesListElementComponent,
    FolderListElementComponent
  ]
})
export class ResourcesModule { }
