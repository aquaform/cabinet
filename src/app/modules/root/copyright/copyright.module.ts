import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CopyrightComponent } from './copyright/copyright.component';
import { InnerHTMLModule } from '../inner-html/inner-html.module';

@NgModule({
  declarations: [CopyrightComponent],
  imports: [
    CommonModule,
    InnerHTMLModule
  ],
  exports: [CopyrightComponent]
})
export class CopyrightModule { }
