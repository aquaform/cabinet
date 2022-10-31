import { Component } from '@angular/core';
import { CourseDataProvider } from '@modules/courses/data/course-data.provider';
import { LearningProvider } from '@modules/courses/learning/learning.provider';
import { ModalWindowSettings } from '@modules/courses/modal/modal.interface';
import { SlideProvider } from '@modules/courses/slides/slide/slide.provider';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { TranslateService } from '@ngx-translate/core';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-command-nav',
  templateUrl: './command-nav.component.html',
  styleUrls: ['./command-nav.component.scss']
})
export class CommandNavComponent extends AppComponentTemplate {

  closeCommandIsAvailable: boolean;
  historyCommandsIsAvailable: boolean;

  glossaryCommandIsAvailable: boolean;
  glossaryCommandIsDisable: boolean;

  homeCommandIsAvailable: boolean;
  homeCommandIsDisable: boolean;

  title: string;

  constructor(
    private lp: LearningProvider,
    private sp: SlideProvider,
    private translate: TranslateService,
    private err: ErrorsService) {

    super();

    this.closeCommandIsAvailable = this.lp.closeCommandIsAvailable();
    this.historyCommandsIsAvailable = this.lp.historyCommandsIsAvailable();
    this.glossaryCommandIsAvailable = this.lp.glossaryCommandIsAvailable();
    this.homeCommandIsAvailable = this.lp.homeCommandIsAvailable();
    this.title = CourseDataProvider.courseTitle();

  }

  ngOnInit(): void {

    this.sp.onChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(slide => {
      if (slide) {
        this.homeCommandIsDisable = (slide === SlideProvider.start());
      }
      // Запрещаем открытие глоссария в интерактивных тестах
      this.glossaryCommandIsDisable = (slide && SlideProvider.isInteractive(slide));
    });

  }

  closeCourse(): void {
    this.lp.close();
  }

  backHistory(): void {
    window.history.back();
  }

  forwardHistory(): void {
    window.history.forward();
  }

  openHome(): void {
    const startSlide = SlideProvider.start();
    if (startSlide) {
      const modalSettings: ModalWindowSettings = { maximizeSize: true, hideCloseButton: true };
      this.lp.goToSlide(startSlide.uuid, "", modalSettings);
    }
  }

  openGlossary(): void {
    this.translate.get('COURSE.NAV.GLOSSARY').pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (text) => {
        const modalSettings: ModalWindowSettings = { title: text };
        this.lp.goToSlide(this.lp.courseData.glossary, "", modalSettings);
      },
      (err) => this.err.register(err)
    );
  }

  openTOC() {
    const curVisibility = this.lp.onChangeTocVisibility.getValue();
    this.lp.onChangeTocVisibility.next(!curVisibility);
  }

}
