import { Component, Input, ElementRef, AfterViewInit } from '@angular/core';
import { SettingsService } from '@modules/root/settings/settings.service';
import { InnerHTML } from '../inner-html.class';

@Component({
  selector: 'app-default-encapsulation',
  templateUrl: './default-encapsulation.component.html',
  styleUrls: ['./default-encapsulation.component.scss']
})
export class DefaultEncapsulationComponent implements AfterViewInit {

  @Input() html: string;

  constructor(
    private el: ElementRef,
    private settings: SettingsService
  ) { }

  ngAfterViewInit() {

    if (!this.el.nativeElement) {
      return;
    }

    const nativeElement = this.el.nativeElement;

    InnerHTML.changeDOM(nativeElement, this.settings);

  }

}
