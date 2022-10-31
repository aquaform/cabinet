import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsComponent } from './news/news.component';
import { TranslateModule } from '@ngx-translate/core';
import { RootModule } from '@modules/root/root.module';



@NgModule({
  declarations: [NewsComponent],
  imports: [
    CommonModule,
    TranslateModule,
    RootModule,
  ],
  exports: [
    NewsComponent
  ]
})
export class NewsModule { }
