import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeURLPipe } from './safe-url.pipe';



@NgModule({
  declarations: [SafeURLPipe],
  imports: [
    CommonModule
  ],
  exports: [
    SafeURLPipe
  ]
})
export class SafeUrlModule { }
