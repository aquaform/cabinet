import { Component, Input } from '@angular/core';
import { LearningProvider } from '@modules/courses/learning/learning.provider';
import { SearchProvider } from '@modules/courses/search/search.provider';
import { AppComponentTemplate } from '@shared/component.template';
import { navTypes, NavTypes } from '../nav.interface';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent extends AppComponentTemplate {

  @Input() type: NavTypes;

  types = navTypes;
  searchCommandIsAvailable: boolean;
  bookmarksCommandIsAvailable: boolean;

  constructor(private lp: LearningProvider) {

    super();

    this.searchCommandIsAvailable = SearchProvider.searchCommandIsAvailable();
    this.bookmarksCommandIsAvailable = this.lp.bookmarksCommandIsAvailable();

  }

  openToc(): void {
    this.openNav(navTypes.TOC);
  }

  openBookmarks(): void {
    this.openNav(navTypes.BOOKMARKS);
  }

  openSearch(): void {
    this.openNav(navTypes.SEARCH);
  }

  private openNav(navType: NavTypes): void {
    const curNaveType: NavTypes = this.lp.onChangeNavType.getValue();
    if (curNaveType !== navType) {
      this.lp.onChangeNavType.next(navType);
    }
  }

}
