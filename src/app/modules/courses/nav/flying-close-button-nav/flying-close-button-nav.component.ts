import { Component, HostBinding, HostListener } from '@angular/core';
import { CourseDataProvider } from '@modules/courses/data/course-data.provider';
import { CloseButtonsPosition, closeButtonsPositions } from '@modules/courses/interface/data-interface/course-data.interface';
import { LearningProvider } from '@modules/courses/learning/learning.provider';
import { AppComponentTemplate } from '@shared/component.template';

@Component({
  selector: 'app-flying-close-button-nav',
  templateUrl: './flying-close-button-nav.component.html',
  styleUrls: ['./flying-close-button-nav.component.scss']
})
export class FlyingCloseButtonNavComponent extends AppComponentTemplate {

  closeButtonsPosition: CloseButtonsPosition = CourseDataProvider.closeButtonPosition();

  @HostBinding('class.leftPosition') leftPosition = this.displayArrow();

  constructor(
    private lp: LearningProvider
  ) {
    super();
  }

  ngOnInit(): void {
  }

  @HostListener('click', ['$event'])
  onClick(e) {
    this.closeCourse();
  }

  displayArrow(): boolean {
    if (this.closeButtonsPosition === closeButtonsPositions.left) {
      return true;
    }
    if (this.closeButtonsPosition === closeButtonsPositions.leftFix) {
      return true;
    }
    return false;
  }

  closeCourse(): void {
    this.lp.close();
  }

}
