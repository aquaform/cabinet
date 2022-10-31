import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './upload/upload.component';
import { TranslateModule } from '@ngx-translate/core';
import { IconModule } from '../icon/icon.module';
import { LoaderModule } from '../loader/loader.module';
import { DeleteUploadedComponent } from './delete-uploaded/delete-uploaded.component';



@NgModule({
  declarations: [UploadComponent, DeleteUploadedComponent],
  imports: [
    CommonModule,
    TranslateModule,
    IconModule,
    LoaderModule
  ],
  exports: [
    UploadComponent,
    DeleteUploadedComponent
  ]
})
export class UploadModule { }
