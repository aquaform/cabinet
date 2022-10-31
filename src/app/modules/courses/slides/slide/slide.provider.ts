import { Injectable } from "@angular/core";
import { CourseDataInterface, SlideDataInterface, slidesTypes } from "../../interface/data-interface/course-data.interface";
import { BehaviorSubject } from "rxjs";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

declare let courseData: CourseDataInterface;

@Injectable({
    providedIn: 'root'
})
export class SlideProvider {

    onChange: BehaviorSubject<SlideDataInterface>; // При изменении слайда
    activeSlide: SlideDataInterface; // Текущий слайд
    onSlideClick: Subject<void>;

    constructor() {

    }

    ////////////////////////////////////////////////////////////////
    // Интерфейс для видимых слайдов

    // Первый видимый слайд
    //
    public static first(): SlideDataInterface {
        const slides = SlideProvider.slides().filter(s => s.type !== slidesTypes.START);
        return (slides.length) ? slides[0] : undefined;
    }

    // Стартовый слайд
    //
    public static start(): SlideDataInterface {
        return SlideProvider.slides().find(s => s.type === slidesTypes.START);
    }

    // Следующий видимый слайд
    //
    public static next(slide: SlideDataInterface): SlideDataInterface {
        if (SlideProvider.emptySlide(slide)) {
            return;
        }
        const slides = SlideProvider.slides();
        return slides[slides.indexOf(slide) + 1];
    }

    // Предыдущий видимый слайд
    //
    public static previous(slide: SlideDataInterface): SlideDataInterface {
        if (SlideProvider.emptySlide(slide)) {
            return;
        }
        const slides = SlideProvider.slides();
        return slides[slides.indexOf(slide) - 1];
    }

    // Получает номер слайды среди всех видимых
    //
    public static numberOf(slide: SlideDataInterface): number {
        if (SlideProvider.emptySlide(slide)) {
            return;
        }
        return SlideProvider.slides().indexOf(slide) + 1;
    }

    // Получает видимые слайды
    //
    public static slides(): SlideDataInterface[] {
        return courseData.slides.filter((slide) => (!slide.hidden));
    }

    // Считает количество видимых слайдов
    //
    public static count(): number {
        return SlideProvider.slides().length;
    }

    ////////////////////////////////////////////////////////////////
    // Интерфейс для всех слайдов

    // Проверяет является слайд статичным
    //
    public static isStatic(slide: SlideDataInterface): boolean {
        if (SlideProvider.emptySlide(slide)) {
            return;
        }
        return (
            !SlideProvider.isService(slide) &&
            !SlideProvider.isInteractive(slide)
        );
    }

    // Проверяет является слайд сервисным
    //
    public static isService(slide: SlideDataInterface): boolean {
        if (SlideProvider.emptySlide(slide)) {
            return;
        }
        return (
            slide.type === slidesTypes.START ||
            slide.type === slidesTypes.FINAL
        );
    }

    // Проверяет является слайд интерактивным
    //
    public static isInteractive(slide: SlideDataInterface): boolean {
        if (SlideProvider.emptySlide(slide)) {
            return;
        }
        return (slide.type === slidesTypes.QUIZ || slide.type === slidesTypes.SCO);
    }

    // Проверяет является слайд интерактивным
    //
    public static isHidden(slide: SlideDataInterface): boolean {
        if (SlideProvider.emptySlide(slide)) {
            return;
        }
        return slide.hidden;
    }

    // Определяет, пустой ли слайд
    //
    public static emptySlide(slide): boolean {
        return !slide;
    }

    // Находит слайд
    //
    public static find(uuid: string): SlideDataInterface {
        return courseData.slides.find((slide) => slide.uuid === uuid);
    }

    // Определяет, состоит ли курс из одного слайда
    //
    public static isSingleSlide(): boolean {
        return SlideProvider.count() < 2;
    }

    init(ngUnsubscribe: Subject<void>) {
        this.onChange = new BehaviorSubject(null); // next у этой подписки вызывается в SlideComponent
        this.onSlideClick = new Subject<void>();
        this.onChange.pipe(takeUntil(ngUnsubscribe)).subscribe(slide => {
            this.activeSlide = slide;
        });
    }

}