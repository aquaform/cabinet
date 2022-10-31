import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleTimerComponent } from './idle-timer/idle-timer.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [IdleTimerComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [
    IdleTimerComponent
  ]
})
export class IdleModule { }
