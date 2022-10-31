import {Component, ElementRef, NgZone} from "@angular/core";
import {CourseDataInterface, SlideDataInterface, slidesTypes} from "../../interface/data-interface/course-data.interface";
import {SlideProvider} from "../../slides/slide/slide.provider";
import {LearningProvider} from "../../learning/learning.provider";
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from "rxjs/operators";

declare let courseData: CourseDataInterface; // global var

@Component({
    selector: "app-pagination-nav",
    templateUrl: "pagination-nav.component.html",
    styleUrls: ["pagination-nav.component.scss"]
})

export class PaginationNavComponent extends AppComponentTemplate {

    // Данные курса

    public slides: SlideDataInterface[];
    public courseData: CourseDataInterface; // Все данные курса
    public activeSlide: SlideDataInterface; // Текущий слайд
    public nextSlide: SlideDataInterface; // Следующий слайд
    public previousSlide: SlideDataInterface; // Предыдущий слайд
    slidesTypes = slidesTypes; // Все типы слайдов

    // Линия прогресса (HTML  элемент)

    public progressBarVisibility: boolean; // Видимость области прогресса
    private progressBarDotWidth = 28; // Длина шарика на линии прогресса
    private requiredAreaWidth: number; // Ширина обязательных элементов, которые нельзя скрыть

    // Доступность команд-действий

    public closeCommandIsAvailable: boolean;
    public glossaryCommandIsAvailable: boolean;
    public glossaryCommandIsDisable: boolean;
    public actionsCommandsIsAvailable: boolean;

    // Конструктор

    constructor(private el: ElementRef, private sp: SlideProvider, private lp: LearningProvider, private ngZone: NgZone) {

        super();

        this.courseData = courseData;
        this.progressBarVisibility = false;
        this.slides = SlideProvider.slides();

        this.closeCommandIsAvailable = lp.closeCommandIsAvailable();
        this.glossaryCommandIsAvailable = lp.glossaryCommandIsAvailable();
        this.actionsCommandsIsAvailable = this.closeCommandIsAvailable || this.glossaryCommandIsAvailable;

        // Подписываемся на изменение текущего слайда
        this.sp.onChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(slide => {
            this.activeSlide = slide;
            this.nextSlide = SlideProvider.next(slide);
            this.previousSlide = SlideProvider.previous(slide);
            // Запрещаем открытие глоссария в интерактивных тестах
            this.glossaryCommandIsDisable = (slide && SlideProvider.isInteractive(slide));
        });

        // Подписываемся на изменение окна

        window.addEventListener('resize', () => {
            this.ngZone.run(() => {
                this.setVisibilityProgressArea();
            });
        });

        this.lp.onLearningChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
            this.ngZone.run(() => {});
        });

    }


    ngOnInit() {

        // Устанавливаем видимость прогресс бара
        setTimeout(() => {
            this.setVisibilityProgressArea();
        }, 1); // setTimeout нужен, так как иначе ширина высчитывается не корректно (чуть меньше, чем надо)

    }

    // Устанавливает видимость панели прогресса
    //
    setVisibilityProgressArea(): void {

        if (SlideProvider.isSingleSlide()) {
            return;
        }

        this.requiredAreaWidth = 0;

        if (!this.requiredAreaWidth) {
            this.requiredAreaWidth = this.el.nativeElement.querySelector('.nav-command').clientWidth; // Ширина обязательных элементов
        }

        if (this.actionsCommandsIsAvailable) {
            this.requiredAreaWidth += this.el.nativeElement.querySelector('.actions-command').clientWidth; // Ширина обязательных элементов
        }

        const progressAreaMinWidth = this.progressBarDotWidth * 2 * SlideProvider.count(); // Минимальная ширина области прогресс бара
        const fullWidth = this.el.nativeElement.clientWidth; // Общая ширина всего компонента целиком

        this.progressBarVisibility = (progressAreaMinWidth + this.requiredAreaWidth < fullWidth);

    }

    // Открывает слайд
    //
    openSlide(slide: SlideDataInterface): void {
        if (!this.isSlideDisabled(slide)) {
            this.lp.goToSlide(slide.uuid);
        }
    }

    openGlossary(): void {
        this.lp.goToSlide(this.lp.courseData.glossary);
    }

    isSlideComplete(slide: SlideDataInterface): boolean {
        return this.lp.isSlideComplete(slide);
    }

    isSlideDisabled(slide: SlideDataInterface): boolean {
        return this.lp.isSlideDisabled(slide);
    }

    numberSlide(slide: SlideDataInterface): number {
        if (slide) {
            return SlideProvider.numberOf(slide);
        } else {
            return 0;
        }

    }

    // Закрывает курс целиком
    //
    closeCourse(): void {
        this.lp.close();
    }

}

