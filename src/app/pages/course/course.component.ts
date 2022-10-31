import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { CourseDataProvider } from '@modules/courses/data/course-data.provider';
import { CourseSettingsInterface } from '@modules/courses/settings/settings.interface';
import { CourseAPISettings } from '@modules/resources/res/res.interface';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { Language } from '@modules/root/i18n/i18n.class';
import { SettingsService } from '@modules/root/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';
import { AppComponentTemplate } from '@shared/component.template';
import { Observable } from 'rxjs';
import { concatMap, takeUntil } from 'rxjs/operators';

declare let courseSettings: CourseSettingsInterface; // global var
declare let courseAPISettings: CourseAPISettings; // global var

@Component({
  selector: 'app-course-page',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CoursePageComponent extends AppComponentTemplate {

  isLoading = true;
  ready = false;

  constructor(
    private err: ErrorsService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private settings: SettingsService,
    private router: Router,
    private translate: TranslateService,
  ) {
    super();
    Language.init(this.translate);
  }

  ngOnInit(): void {

    this.loadCourse();

  }

  loadCourse() {

    const currentCourseSettings: string = localStorage.getItem(this.settings.StorageName('courseSettings'));
    const currentCourseAPISettings: string = localStorage.getItem(this.settings.StorageName('courseAPISettings'));

    if (!currentCourseSettings || !currentCourseAPISettings) {
      this.err.register("Course settings data not found");
      this.router.navigate(['/']);
      return;
    }

    window['courseSettings'] = JSON.parse(currentCourseSettings);
    window['courseAPISettings'] = JSON.parse(currentCourseAPISettings);

    const loadDataFile$: Observable<void> = new Observable((observer) => {
      const script = this.renderer.createElement('script');
      script.src = `${courseSettings.data.base}/${courseSettings.data.storage}/${courseSettings.data.container}.js`;
      script.onload = () => {
        observer.next();
        observer.complete();
      };
      this.renderer.appendChild(this.elementRef.nativeElement, script);
    });

    const loadCourseData$ = CourseDataProvider.loadData;

    loadDataFile$.pipe(concatMap(() => {
      return loadCourseData$;
    })).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      () => this.ready = true,
      (err) => this.err.register(err),
      () => this.isLoading = false
    );

  }


}
