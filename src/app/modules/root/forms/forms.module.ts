import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormFieldComponent } from './form-field/form-field.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { InnerHTMLModule } from '@modules/root/inner-html/inner-html.module';

@NgModule({
  declarations: [FormFieldComponent],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    InnerHTMLModule
  ],
  exports: [
    FormFieldComponent
  ]
})
export class AppFormsModule { }
