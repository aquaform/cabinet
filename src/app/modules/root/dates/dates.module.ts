import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodComponent } from './period/period.component';
import { TranslateModule } from '@ngx-translate/core';
import { DifferenceComponent } from './difference/difference.component';
import { DurationComponent } from './duration/duration.component';

@NgModule({
  declarations: [
    PeriodComponent,
    DifferenceComponent,
    DurationComponent
  ],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [
    PeriodComponent,
    DifferenceComponent,
    DurationComponent
  ]
})
export class DatesModule { }
