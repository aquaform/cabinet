import { Component, OnInit, Input } from '@angular/core';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);


@Component({
  selector: 'app-difference',
  templateUrl: './difference.component.html',
  styleUrls: ['./difference.component.scss']
})
export class DifferenceComponent implements OnInit {

  @Input() start: Date;
  @Input() end: Date;
  @Input() displayAgo: boolean;

  difference = "";

  constructor() { }

  ngOnInit() {
    const date1 = dayjs(this.start);
    const date2 = dayjs(this.end);
    this.difference = date1.from(date2, true);
  }

}
