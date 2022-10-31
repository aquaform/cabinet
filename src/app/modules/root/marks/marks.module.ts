import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetMarkComponent } from './set-mark/set-mark.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DisplayStarMarkComponent } from './display-star-mark/display-star-mark.component';
import { IconModule } from '../icon/icon.module';

@NgModule({
  declarations: [SetMarkComponent, DisplayStarMarkComponent],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IconModule
  ],
  exports: [
    SetMarkComponent,
    DisplayStarMarkComponent
  ]
})
export class MarksModule { }
