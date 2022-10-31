import { Component } from '@angular/core';
import { LearningProvider } from '@modules/courses/learning/learning.provider';
import { SlideProvider } from '@modules/courses/slides/slide/slide.provider';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-current-bookmark-nav',
  templateUrl: './current-bookmark-nav.component.html',
  styleUrls: ['./current-bookmark-nav.component.scss']
})
export class CurrentBookmarkNavComponent extends AppComponentTemplate {

  bookmarkIsActive: boolean;

  constructor(private lp: LearningProvider, private sp: SlideProvider) {
    super();
  }

  ngOnInit(): void {

    this.lp.onChangeBookmarks.pipe(takeUntil(this.ngUnsubscribe)).subscribe((bookmarks) => {
      this.checkBookmarkIsActive();
    });

    this.sp.onChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe((slideData) => {
      this.checkBookmarkIsActive();
    });

  }

  checkBookmark(): void {
    this.lp.checkBookmark();
  }

  checkBookmarkIsActive() {
    if (this.sp.activeSlide) {
      this.bookmarkIsActive = this.lp.bookmarkIsActive(this.sp.activeSlide.uuid);
    } else {
      this.bookmarkIsActive = false;
    }
  }

}
