import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-folder-list-element',
  templateUrl: './folder-list-element.component.html',
  styleUrls: ['./folder-list-element.component.scss']
})
export class FolderListElementComponent implements OnInit {

  @Input() id: string;
  @Input() name: string;

  @Output() emitOpenFolder = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  openFolder() {
    this.emitOpenFolder.emit(this.id);
  }

}
