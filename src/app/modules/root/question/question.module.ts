import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionComponent } from './question/question.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [QuestionComponent],
  imports: [
    CommonModule,
    TranslateModule,
  ],
  exports: [QuestionComponent]
})
export class QuestionModule { }
