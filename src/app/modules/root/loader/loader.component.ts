import { Component, OnInit, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  @Input() @HostBinding("class.modal") modal = false;

  constructor() { }

  ngOnInit() {
  }

}
