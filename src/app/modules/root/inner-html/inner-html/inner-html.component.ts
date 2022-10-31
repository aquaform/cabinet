import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-inner-html',
  templateUrl: './inner-html.component.html',
  styleUrls: ['./inner-html.component.scss'],
})
export class InnerHTMLComponent {

  @Input() html: string;

  isShadowDomSupport = !!document.head.attachShadow; // ShadowDom нужен для отображения стилей

  constructor() {}

}
