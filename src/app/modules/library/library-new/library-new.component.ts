import { Component, OnInit, Input } from '@angular/core';
import { LibraryTreeElement } from '../library.interface';
import { DatesTools } from '@modules/root/dates/dates.class';
import { numberToDate } from '@modules/root/api/api.converter';

@Component({
  selector: 'app-library-new',
  templateUrl: './library-new.component.html',
  styleUrls: ['./library-new.component.scss']
})
export class LibraryNewComponent implements OnInit {

  @Input() allElements: LibraryTreeElement[] = [];
  @Input() isLoading = false;

  constructor() { }

  ngOnInit() {
  }

  newElements(): LibraryTreeElement[] {
    const allResources = this.allElements.filter(val => !!val.res);
    DatesTools.sortByDate(allResources, val => numberToDate(val.res.addDate), true, true);
    return allResources.slice(0, 5);
  }

  dateFromNumber(num: number): Date {
    return numberToDate(num);
  }

}
