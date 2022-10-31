import { Component, OnInit, Input, EventEmitter, Output, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, AfterViewInit {

  @Input() placeholder: string;
  @Input() readOnly: boolean;
  @Input() autofocus: boolean;
  @Input() content: string;
  @Output() contentChange = new EventEmitter<string>();

  onContentChange(content: string) {
    this.content = content;
    this.contentChange.emit(content);
  }

  constructor(
    private el: ElementRef
  ) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    if (this.autofocus) {
      this.doAutoFocus();
    }
  }

  doAutoFocus() {
    const elements = this.el.nativeElement.querySelectorAll(".ql-editor");
    if (elements && elements.length === 1) {
      elements[0].focus();
    }
  }

  onEditorCreated() {
    // Убираем выделение кнопок редактора по TAB
    if (!this.el || !this.el.nativeElement) {
      return;
    }
    const elements = this.el.nativeElement.querySelectorAll("[tabindex], button");
    if (!elements) {
      return;
    }
    for (const element of elements) {
      element.setAttribute('tabindex', '-1');
    }
  }

}
