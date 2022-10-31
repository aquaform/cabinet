import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './editor/editor.component';
import { QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [EditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    QuillModule
  ],
  exports: [
    EditorComponent
  ]
})
export class EditorModule { }
