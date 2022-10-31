import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InnerHTMLComponent } from './inner-html/inner-html.component';
import { SafeHTMLPipe } from './safe-html.pipe';
import { ShadowDomComponent } from './shadow-dom/shadow-dom.component';
import { DefaultEncapsulationComponent } from './default-encapsulation/default-encapsulation.component';

@NgModule({
  declarations: [InnerHTMLComponent, SafeHTMLPipe, ShadowDomComponent, DefaultEncapsulationComponent],
  imports: [
    CommonModule,
  ],
  exports: [
    InnerHTMLComponent,
    SafeHTMLPipe
  ]
})
export class InnerHTMLModule { }
