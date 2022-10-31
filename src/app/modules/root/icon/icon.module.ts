import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon/icon.component';

/*
Solutions:
https://medium.com/@rubenvermeulen/using-an-svg-sprite-icon-system-in-angular-9d4056357b60
https://icomoon.io/
*/

@NgModule({
  declarations: [IconComponent],
  imports: [
    CommonModule
  ],
  exports: [
    IconComponent
  ]
})
export class IconModule { }
