import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryTreeComponent } from './library-tree/library-tree.component';
import { LibraryNewComponent } from './library-new/library-new.component';
import { TranslateModule } from '@ngx-translate/core';
import { RootModule } from '@modules/root/root.module';
import { ResourcesModule } from '@modules/resources/resources.module';

@NgModule({
  declarations: [
    LibraryTreeComponent,
    LibraryNewComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RootModule,
    ResourcesModule
  ],
  exports: [
    LibraryTreeComponent,
    LibraryNewComponent
  ]
})
export class LibraryModule { }
