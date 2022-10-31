import { Component, AfterViewInit, Input, ElementRef, ViewEncapsulation } from '@angular/core';
import { SettingsService } from '@modules/root/settings/settings.service';
import { InnerHTML } from '../inner-html.class';

@Component({
  selector: 'app-shadow-dom',
  templateUrl: './shadow-dom.component.html',
  styleUrls: ['./shadow-dom.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class ShadowDomComponent implements AfterViewInit {

  @Input() html: string;

  constructor(
    private el: ElementRef,
    private settings: SettingsService
  ) { }

  ngAfterViewInit() {

    if (!this.el.nativeElement) {
      return;
    }

    const nativeElement = this.el.nativeElement.shadowRoot

    InnerHTML.changeDOM(nativeElement, this.settings);

  }

}
