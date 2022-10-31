import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { ArchiveSlideDataInterface, AudioSlideDataInterface, CollectionSlideDataInterface, CourseDataInterface, FinalSlideDataInterface, GlossarySlideDataInterface, HTMLSlideDataInterface, ImageSlideDataInterface, PDFSlideDataInterface, QuizSlideDataInterface, SCOSlideDataInterface, SlideDataInterface, slidesTypes, StartSlideDataInterface, TextSlideDataInterface, VideoSlideDataInterface, WordSlideDataInterface, YouTubeSlideDataInterface } from "../../interface/data-interface/course-data.interface";
import { SlideProvider } from "./slide.provider";
import { LearningProvider } from "../../learning/learning.provider";
import { BROWSER } from "../../tools/universal/browser";
import { DOM } from "../../tools/dom";
import { AlertProvider } from "../../alert/alert.provider";
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';
import { ModalSlideCommands, ModalWindowSettings } from "@modules/courses/modal/modal.interface";

declare let courseData: CourseDataInterface; // global var

@Component({
    selector: "slide",
    templateUrl: "slide.component.html",
    styleUrls: ["slide.component.scss"]
})

export class SlideComponent extends AppComponentTemplate {

    @Input() slide: SlideDataInterface; // Текущий слайд
    @Input() isMain = true; // Это слайд в основном окне (не модальное)
    @Output() emitModalSlideCommand = new EventEmitter<ModalSlideCommands>();

    uuidAttempt: string;
    uuidPage: string;

    private routerParamsHash: string; // Роутинг в виде строки

    courseData: CourseDataInterface = courseData;
    slidesTypes = slidesTypes; // Все типы слайдов

    @HostBinding('class.oldWebkit') oldWebkit = BROWSER.oldWebkit();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private sp: SlideProvider,
        private lp: LearningProvider,
        private el: ElementRef,
        private alert: AlertProvider) {

        super();

    }

    ngOnInit() {

        this.el.nativeElement.onclick = () => {
            this.sp.onSlideClick.next();
        };

        this.alert.onChange
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                setTimeout(() => {
                    this.setElementHeight();
                });
            });


        if (this.isMain) {

            // К моменту формирования компонента,
            // роутинг уже сформирован и событие events.subscribe уже
            // отработало и его уже не надо ждать, поэтому вызываем this.onRoute();

            this.onRoute();

            this.router.events
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((val) => {
                    if (val instanceof NavigationEnd) {
                        const routerParamsHash = this.getRouterParamsHash();
                        if (this.routerParamsHash !== routerParamsHash) {
                            this.onRoute(); // Только если это новый роутинг
                        }
                    }
                });

        }
    }

    @HostListener('window:resize', ['$event'])
    onResize($event) {
        this.setElementHeight();
    }

    private onRoute(): void {

        this.routerParamsHash = this.getRouterParamsHash(); // Сохраняем текущий роутинг

        let uuid = "";

        if (this.route.snapshot.params && "slide" in this.route.snapshot.params) {
            uuid = this.route.snapshot.params["slide"];
        }

        const slide = SlideProvider.find(uuid);

        if (!slide || this.lp.isSlideDisabled(slide)) {

            // Переходим в корень или к последнему слайду, если слайд недоступен,
            // при этом только заменяем url, без записи в историю,
            // чтобы можно было нормально перейти назад, если пришли с другого места.
            // lastSlide и firstSlide не могут быть скрытыми (доп. проверка не требуется)

            const lastSlide: SlideDataInterface = SlideProvider.find(this.lp.learning.lastSlide);
            const startSlide: SlideDataInterface = SlideProvider.start();
            const firstSlide: SlideDataInterface = SlideProvider.first();

             if (lastSlide && !SlideProvider.isHidden(lastSlide) && !this.lp.isSlideDisabled(lastSlide)) {
                this.lp.goToSlide(lastSlide.uuid);
            } else  if (startSlide) {
                const modalSettings: ModalWindowSettings = {maximizeSize: true, hideCloseButton: true};
                this.lp.goToSlide(startSlide.uuid, "", modalSettings);
            } else if(firstSlide) {
                this.lp.goToSlide(firstSlide.uuid);
            }

        } else {

            const uuidPageInParams = (this.route.snapshot.params && "page" in this.route.snapshot.params)
                ? this.route.snapshot.params["page"] : "";

            if (slide.type === slidesTypes.QUIZ) {
                const uuidAttemptInParams = (this.route.snapshot.params && "attempt" in this.route.snapshot.params)
                    ? this.route.snapshot.params["attempt"] : "";
                if (uuidPageInParams && uuidAttemptInParams && this.lp.activity) {
                    // Это обычная страница теста. Проверка на существование this.lp.activity
                    // нужна, чтобы убедиться, что активность открыта для теста.
                    // Если она открыта после перезагрузки страницы, когда нет явно открытой активности,
                    // то перебрасываем на начальную страницу теста (сработает третье условие).
                    this.uuidPage = uuidPageInParams;
                    this.uuidAttempt = uuidAttemptInParams;
                } else if (uuidAttemptInParams && !uuidPageInParams && !this.lp.activity) {
                    // Это финальная страница теста
                    this.uuidPage = "";
                    this.uuidAttempt = uuidAttemptInParams;
                } else {
                    // Переходим в начало теста
                    this.uuidPage = "";
                    this.uuidAttempt = "";
                    // Обязательно сбрасываем адрес до начальной страницы теста,
                    // так как если сохранится роутинг страницы теста, например,
                    // после перезагрузки страницы и будет нажата
                    // команда Продолжить, то не отрисуется страница теста, так как
                    // роутинг не изменится и система будет думать, то отображается она.
                    this.router.navigate(['/course', 'slide', slide.uuid], { replaceUrl: true });
                }
            } else if (slide.type === slidesTypes.COLLECTION && uuidPageInParams) {
                this.uuidPage = uuidPageInParams;
            } else {
                this.uuidPage = "";
            }

            this.slide = null;

            setTimeout(() => {
                this.slide = slide;
                if (!slide.hidden) {
                    this.lp.learning.lastSlide = slide.uuid;
                }
                this.sp.onChange.next(slide);
                setTimeout(() => {
                    this.setElementHeight();
                });
            });

        }

    }

    private getRouterParamsHash(): string {
        return this.route.snapshot.url.join();
    }

    private setElementHeight(): void {
        DOM.setHeightForOldWebKit(this.el);
    }

    doModalSlideCommand(command: ModalSlideCommands) {
        this.emitModalSlideCommand.emit(command);
    }



    get archiveSlide(): ArchiveSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.ARCHIVE) ? this.slide as ArchiveSlideDataInterface : undefined;
    }

    get audioSlide(): AudioSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.AUDIO) ? this.slide as AudioSlideDataInterface : undefined;
    }

    get collectionSlide(): CollectionSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.COLLECTION) ? this.slide as CollectionSlideDataInterface : undefined;
    }

    get finalSlide(): FinalSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.FINAL) ? this.slide as FinalSlideDataInterface : undefined;
    }

    get glossarySlide(): GlossarySlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.GLOSSARY) ? this.slide as GlossarySlideDataInterface : undefined;
    }

    get htmlSlide(): HTMLSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.HTML) ? this.slide as HTMLSlideDataInterface : undefined;
    }

    get imageSlide(): ImageSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.IMAGE) ? this.slide as ImageSlideDataInterface : undefined;
    }

    get pdfSlide(): PDFSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.PDF) ? this.slide as PDFSlideDataInterface : undefined;
    }

    get quizSlide(): QuizSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.QUIZ) ? this.slide as QuizSlideDataInterface : undefined;
    }

    get scoSlide(): SCOSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.SCO) ? this.slide as SCOSlideDataInterface : undefined;
    }

    get startSlide(): StartSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.START) ? this.slide as StartSlideDataInterface : undefined;
    }

    get textSlide(): TextSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.TEXT) ? this.slide as TextSlideDataInterface : undefined;
    }

    get videoSlide(): VideoSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.VIDEO) ? this.slide as VideoSlideDataInterface : undefined;
    }

    get wordSlide(): WordSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.WORD) ? this.slide as WordSlideDataInterface : undefined;
    }

    get youtubeSlide(): YouTubeSlideDataInterface {
        return (this.slide && this.slide.type === slidesTypes.YOUTUBE) ? this.slide as YouTubeSlideDataInterface : undefined;
    }


}

