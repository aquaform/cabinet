/**
 * Created by Baranoshnikov on 20.04.2017.
 */

import { ElementRef, Injectable } from "@angular/core";
import {
    CourseDataInterface, GlossarySlideDataInterface, SlideDataInterface,
    slidesTypes,
    QuizSlideDataInterface
} from "../interface/data-interface/course-data.interface";
import {
    ActivitiesTypes, activitiesTypes, ActivityInterface, BookmarksInterface, LearningInterface
} from "../interface/learning-interface/learning.interface";
import { APIProvider } from "./api/api.provider";
import { StandardProcessingInterface } from "../tools/universal/processing";
import { SlideProvider } from "../slides/slide/slide.provider";
import { QuizAttemptProvider } from "./interactive/quiz-attempt/quiz-attempt.provider";
import { QuestionAnswerProvider } from "./interactive/question-answer/question-answer.provider";
import { QuizAttemptInterface } from "../interface/learning-interface/quiz/quiz-attempt.interface";
import { Subject } from "rxjs";
import { SCOAttemptProvider } from "./interactive/sco-attempt/sco-attempt.provider";
import { SCOAttemptInterface } from "../interface/learning-interface/sco/sco-attempt.interface";
import { TocNavTools } from "../nav/toc-nav/toc-nav.tools";
import { QuestionAnswerInterface } from "../interface/learning-interface/quiz/question-answer.interface";
import { Router } from "@angular/router";
import { ModalProvider } from "../modal/modal.provider";
import { Links } from "../tools/links";
import { UUID } from "../tools/universal/uuid";
import { OBJECTS } from "../tools/universal/objects";
import { TermDataInterface } from "../interface/data-interface/slides/glossary-data.interface";
import { BehaviorSubject } from "rxjs";
import { WINDOW } from "../tools/universal/window";
import { ErrorProvider } from "../error/error.provider";
import { errorCodes } from "../error/error.interface";
import { Terms } from "../tools/terms";
import { navTypes, NavTypes } from "../nav/nav.interface";
import { environment } from '@environments/environment';
import { StringsTools } from '@modules/root/strings/strings.class';
import { CourseDataProvider } from '../data/course-data.provider';
import { modalTypes, ModalWindowSettings } from "../modal/modal.interface";
import { takeUntil } from "rxjs/operators";

declare let courseData: CourseDataInterface; // Данные курсы видны глобально
declare let getLearningData: any; // Глобальная функция для 1С

interface ScrollPositionStoreInterface {
    [slide: string]: number;
}

@Injectable({
    providedIn: 'root'
})
export class LearningProvider {

    public onGetLearningData: Subject<LearningInterface>;
    public onLearningChange: Subject<boolean>;
    public onLearningError: Subject<string>;
    public onClose: Subject<any>;
    public onChangeTocVisibility: BehaviorSubject<boolean>; // Содержание видно изначально
    // при первом открытии если размер окна больше или равен 900px.
    public onChangeNavType: BehaviorSubject<NavTypes>;
    public onChangeBookmarks: BehaviorSubject<BookmarksInterface>;

    public lastTocSlideSelected: string; // Последний интерактивно выбранный слайд из содержания
    public learning: LearningInterface; // Текущее изучение курса
    public activity: ActivityInterface; // Текущая активность
    public courseData: CourseDataInterface; // Все данные курса
    public scrollPositions: ScrollPositionStoreInterface;

    private closed: boolean;

    constructor(
        private api: APIProvider,
        private qp: QuizAttemptProvider,
        private sp: SlideProvider,
        private qa: QuestionAnswerProvider,
        private sco: SCOAttemptProvider,
        private router: Router,
        private mp: ModalProvider,
        private ep: ErrorProvider) {

    }

    init(ngUnsubscribe: Subject<void>) {

        this.onGetLearningData = new Subject();
        this.onLearningChange = new Subject();
        this.onLearningError = new Subject();
        this.onClose = new Subject();
        this.onChangeTocVisibility = new BehaviorSubject(WINDOW.tabletLandscapeUp());
        this.onChangeNavType = new BehaviorSubject<NavTypes>(navTypes.TOC);
        this.onChangeBookmarks = new BehaviorSubject<BookmarksInterface>(null);

        this.scrollPositions = {};

        this.closed = false;

        // Получаем данные всего курса

        if ('courseData' in window) {
            this.courseData = courseData;
        } else {
            return;
        }

        // Подписываемся на получение данных изучения

        this.api.onLoad.pipe(takeUntil(ngUnsubscribe)).subscribe(learningData => {

            if (learningData) {
                this.learning = learningData;
            } else {
                this.learning = {
                    uuid: UUID.get(),
                    course: this.courseData.uuid,
                    complete: false,
                    score: 0,
                    progress: 0,
                    lastSlide: "",
                    activities: []
                };
            }

            this.onGetLearningData.next(this.learning);

            if ("bookmarks" in this.learning) {
                this.onChangeBookmarks.next(this.learning.bookmarks);
            }

        });

        this.api.onError.pipe(takeUntil(ngUnsubscribe)).subscribe((error: string) => {
            this.onLearningError.next(error);
        });

        // Формируем глобальную функцию для получения данных изучения из 1С

        window['getLearningData'] = () => {
            this.beforeCloseApp();
            return JSON.stringify(this.learning);
        };

        // Подписываемся на закрытие окна

        window['onunload'] = () => {
            if (!this.closed) {
                this.onunload(true);
            }
        };

        // Подписываемся на postMessage

        window['addEventListener']("message",
            (e) => {
                if (!e || !('data' in e) || typeof e.data !== 'string') {
                    return;
                }
                if (environment.displayLog) {
                    console.log("Post message course raw data", e);
                }
                if (StringsTools.IsJSON(e.data)) {
                    const dataObject = JSON.parse(e.data);
                    if ("type" in dataObject
                        && dataObject.type === "goToLink"
                        && "data" in dataObject
                        && Links.isInternal(dataObject.data)) {
                        this.goToLink(Links.removeMarker(dataObject.data));
                    }
                }
                if (e.data.substr(0, Links.prefix().length) === Links.prefix()) {
                    this.goToLink(e.data.substr(Links.prefix().length));
                }
                if (e.data.substr(0, "event:".length) === "event:") {
                    this.sp.onSlideClick.next();
                }
                if (e.data.substr(0, "scrollPosition:".length) === "scrollPosition:" && !!this.activity && !!this.activity.slide) {
                    const scrollPosition: number = Number(e.data.substr("scrollPosition:".length));
                    this.saveScrollPosition(this.activity.slide, scrollPosition);
                }
            },
            false);

        window['addEventListener']('resize', () => {
            this.scrollPositions = {}; // Сбрасываем запомненные позиции скролинга при изменении размера окна
        });

        // Подписываемся на изменение активного слайда
        // для учета изученных статичных слайдов.

        this.sp.onChange.pipe(takeUntil(ngUnsubscribe)).subscribe((slide) => {

            if (!slide) {
                return;
            }

            this.onCloseSCOSlide(slide);
            this.onOpenStaticSlide(slide);

            if (this.qp.attempt && slide.uuid !== this.qp.attempt.slide) {
                this.qp.leave(); // Сообщаем в провайдер теста, что пользователь вышел из теста
            }

        });

        // Подписываемся на клик по слайду
        //

        this.sp.onSlideClick.pipe(takeUntil(ngUnsubscribe)).subscribe(() => {
            if (!WINDOW.tabletLandscapeUp()) {
                // Закрываем панель при щелчке на слайд
                this.onChangeTocVisibility.next(false);
            }
        });

        // Подписываемся на изменение модального окна
        // для учета обучения в нем

        this.mp.onOpenWindow.pipe(takeUntil(ngUnsubscribe)).subscribe((modal) => {
            if (this.qp.attempt && modal.slide.uuid !== this.qp.attempt.slide) {
                this.qp.leave(); // Сообщаем в провайдер теста, что пользователь вышел из теста
            }
        });

        this.mp.onChange.pipe(takeUntil(ngUnsubscribe)).subscribe((modal) => {
            if (modal.type === modalTypes.SLIDE) {
                this.onOpenStaticSlide(modal.slide);
            }
        });

        this.mp.onCloseWindow.pipe(takeUntil(ngUnsubscribe)).subscribe((modal) => {

            const slide = (modal.slideToRestoreAfterClose) ? SlideProvider.find(modal.slideToRestoreAfterClose) : undefined;

            if (!slide) {
                return;
            }

            // Восстанавливаем активность при закрытии модального окна

            this.onOpenStaticSlide(slide);

            // Восстанавливаем сессию теста

            if (slide.type === slidesTypes.QUIZ) {
                const activity = this.learning.activities.find((a) => a.slide === slide.uuid);
                if (activity) {
                    const incompleteQuizAttempt = activity.quizAttempts.find((q) => !q.complete);
                    if (incompleteQuizAttempt) {
                        this.qp.resume(incompleteQuizAttempt, slide as QuizSlideDataInterface);
                    }
                }
            }

        });

        // Подписываемся на начало тестирования
        // для создания активности для теста.

        this.qp.onStart.pipe(takeUntil(ngUnsubscribe)).subscribe((quizAttempt) => {

            const activities = [];

            let activity = this.learning.activities.find((a) => a.slide === quizAttempt.slide);

            if (activity) {
                this.resumeActivity(activity);
            } else {
                activity = this.startActivity(SlideProvider.find(quizAttempt.slide));
            }

            activity.quizAttempts.push(quizAttempt);

            activities.push(activity);

            this.api.save(this.learning, activities, false, false);

        });

        this.qp.onComplete.pipe(takeUntil(ngUnsubscribe)).subscribe((quizAttempt) => {

            const activities = [];

            if (!this.activity) {
                console.error("Parent quiz activity not found.");
                return;
            }

            if (this.activity.slide !== quizAttempt.slide) {
                console.error("Current activity is not quiz.");
                return;
            }

            activities.push(this.activity);

            let maxScore = 0; // Максимальный балл за все попытки теста

            for (const attempt of this.activity.quizAttempts) {
                if (attempt.score > maxScore) {
                    maxScore = attempt.score;
                }
            }

            this.completeActivity(quizAttempt.end, maxScore);

            this.api.save(this.learning, activities, false, false);

        });

        this.qp.onResume.pipe(takeUntil(ngUnsubscribe)).subscribe((quizAttempt: QuizAttemptInterface) => {

            const activities = [];
            const activity = this.learning.activities.find((a) => a.slide === quizAttempt.slide);
            this.resumeActivity(activity);
            activities.push(activity);

            this.api.save(this.learning, activities, false, false);

        });

        // Подписываемся на ответы на вопросы

        this.qa.onComplete.pipe(takeUntil(ngUnsubscribe)).subscribe((answer: QuestionAnswerInterface) => {

            const activities = [];

            const nextPage = this.qp.nextPage();

            if (!nextPage) {
                // Если нет следующей страницы, то будет
                // выполнено завершение теста и он будет сохранен,
                // поэтому сохранять этот ответ на вопрос не надо.
                return;
            }

            activities.push(this.activity);

            this.api.save(this.learning, activities, false, false);

        });

        // Подписываемся на события SCO

        this.sco.onInitialize.pipe(takeUntil(ngUnsubscribe)).subscribe((scoAttempt: SCOAttemptInterface) => {

            let activity = this.learning.activities.find((a) => a.slide === scoAttempt.slide);

            if (activity) {
                this.resumeActivity(activity);
            } else {
                activity = this.startActivity(SlideProvider.find(scoAttempt.slide));
            }

            if (scoAttempt.cmi.entry !== "resume") {
                // Добавляем новую активность SCO.
                // Это надо сделать здесь, так как в провайдере
                // SCO общая активность еще не создана и не может быть
                // изменена.
                activity.scoAttempts.push(scoAttempt);
            }

        });

        this.sco.onCommit.pipe(takeUntil(ngUnsubscribe)).subscribe((scoAttempt: SCOAttemptInterface) => {

            this.updateSCOActivity();

            const activities = [];
            activities.push(this.activity);
            this.api.save(this.learning, activities, false, false);

            this.onLearningChange.next(true);
            this.updateLearningParams();

        });

        this.sco.onTerminate.pipe(takeUntil(ngUnsubscribe)).subscribe((scoAttempt: SCOAttemptInterface) => {

            this.updateSCOActivity();
            this.updateLearningParams();

            if (SlideProvider.isSingleSlide()) {
                this.sco.onClose.next();
                this.sco.onClose.complete();
            } else {
                const activities = [];
                activities.push(this.activity);
                this.api.save(this.learning, activities, false, false);

                this.onLearningChange.next(true);
            }

        });

    }

    // Завершает открытые активности перед закрытием приложения
    // и возвращает их список
    //
    private beforeCloseApp(): ActivityInterface[] {

        const activities = [];

        if (this.activity && SlideProvider.isStatic(SlideProvider.find(this.activity.slide))) {
            activities.push(this.activity);
            this.completeActivity();
        }

        if (this.activity && this.activity.type === activitiesTypes.SCO) {
            activities.push(this.activity);
            this.updateSCOActivity();
        }

        return activities;

    }

    // Обновляет параметры общей активности на основе активности SCO
    //
    private updateSCOActivity() {

        if (!this.activity) {
            console.error("Activity with SCO not found");
            return;
        }

        // Получаем переменные из списка всех попыток SCO

        let complete = false;
        let maxScore = 0; // Максимальный балл за все попытки теста
        let progress = 0;

        for (const attempt of this.activity.scoAttempts) {
            if (attempt.complete) {
                complete = true;
            }
            if (attempt.score > maxScore) {
                maxScore = attempt.score;
            }
            if (attempt.progress > progress) {
                progress = attempt.score;
            }
        }

        // Завершаем активность

        if (complete) {
            this.activity.complete = true;
            this.activity.progress = 100;
            this.activity.score = maxScore;
        } else {
            this.activity.progress = progress;
        }

    }

    private onCloseSCOSlide(slide: SlideDataInterface) {

        if (this.activity && this.activity.type === activitiesTypes.SCO && slide.uuid !== this.activity.slide) {
            this.completeActivity();
            // Сохранять данные в БД не надо, так как это делается в событиях SCO
        }

    }

    // При открытии статичного слайда
    //
    private onOpenStaticSlide(slide: SlideDataInterface) {

        const activities = [];

        if (this.activity && SlideProvider.isStatic(SlideProvider.find(this.activity.slide)) && slide.uuid !== this.activity.slide) {
            activities.push(this.activity);
            this.completeActivity();
        }

        if (SlideProvider.isStatic(slide)) {

            const activity = this.learning.activities.find((a) => a.slide === slide.uuid);

            if (activity) {
                this.resumeActivity(activity);
            } else {
                this.startActivity(slide); // Начинаем новую статичную активность
            }

            activities.push(this.activity);

        }

        this.api.save(this.learning, activities, false, false);

    }

    // Начинает новую активность
    //
    public startActivity(slide: SlideDataInterface): ActivityInterface {

        const activity: ActivityInterface = {
            uuid: UUID.get(),
            complete: false,
            progress: 0,
            type: LearningProvider.typeActivity(slide),
            slide: slide.uuid,
            start: new Date(),
            end: null,
            score: 0,
            attempts: []
        };

        activity.attempts.push({
            start: activity.start,
            end: null
        });

        if (slide.type === slidesTypes.QUIZ) {
            activity.quizAttempts = [];
        }

        if (slide.type === slidesTypes.SCO) {
            activity.scoAttempts = [];
        }

        this.activity = activity;
        this.learning.activities.push(activity);

        return activity;

    }

    // Делает активной ранее созданную активность
    //
    public resumeActivity(activity: ActivityInterface) {

        if (this.activity === activity) {
            return; // Ничего не делаем, если пытаемся восстановить уже активную активность.
        }

        activity.attempts.push({
            start: new Date(),
            end: null
        });

        this.activity = activity;

    }

    // Завершает текущую активность
    //
    public completeActivity(endDate?: Date, score?: number): void {

        if (!this.activity) {
            console.error("Activity not found.");
            return;
        }

        // Задаем свойства завершенной активности

        this.activity.complete = true;
        this.activity.end = (endDate) ? endDate : new Date();
        this.activity.score = (typeof (score) === 'number' && score) ? score : this.activity.score;
        this.activity.attempts.slice(-1)[0].end = this.activity.end; // Фиксируем дату окончания последней попытки

        this.activity = undefined;

        // Обновляем статистику обучения

        this.updateLearningParams();

    }

    private updateLearningParams() {

        // Определяем прогресс изучения

        let maxProgress = 0;
        let realProgress = 0;
        const slides = SlideProvider.slides();

        for (const slide of slides) {
            if (SlideProvider.isService(slide)) {
                continue; // Пропускаем сервисные слайды
            }
            maxProgress = maxProgress + 100;
            realProgress = realProgress + this.slideProgress(slide);
        }

        this.learning.progress = (maxProgress > 0) ? Math.round((realProgress / maxProgress) * 100) : 100;
        this.learning.complete = (this.learning.progress === 100);

        // Считаем баллы за изучение

        if (this.learning.complete) {

            let maxScore = 0;
            let realScore = 0;

            for (const slide of slides) {

                if (slide.type !== slidesTypes.QUIZ && slide.type !== slidesTypes.SCO) {
                    continue;
                }

                maxScore += 100;

                const activity = this.learning.activities.find((a) => a.slide === slide.uuid);

                if (activity && activity.complete) {
                    realScore += activity.score;
                }

            }

            this.learning.score = (maxScore > 0) ? Math.round((realScore / maxScore) * 100) : 100;

            // Примечание: если нет тестов (maxScore === 0), то при завершении обучения ставим 100.
            // Это логично, так как пользователь ожидает увидеть оценку отличную от 0 при завершенности курса.
            // Возможно, он хочет поставить Зачет только за изучение курса.

        }

    }

    // Определяет пройден ли слайд
    //
    public isSlideComplete(slide: SlideDataInterface): boolean {

        if (!this.learning || !slide) {
            return false;
        }

        const result = this.learning.activities.find(
            (activity) => activity.slide === slide.uuid && activity.complete === true
        );

        return !!(result);

    }

    // Определяет прогресс слайда
    //
    public slideProgress(slide: SlideDataInterface): number {

        if (!this.learning || !slide) {
            return 0;
        }

        if (this.isSlideComplete(slide)) {
            return 100;
        } else {
            const activity = this.learning.activities.find((a) => a.slide === slide.uuid);
            if (activity) {
                return activity.progress;
            } else {
                return 0;
            }
        }

    }

    // Определяет заблокирован ли слайд
    //
    public isSlideDisabled(slide: SlideDataInterface): boolean {

        if (TocNavTools.tocAvailable()) {
            return false;
        }

        if (!this.learning) {
            return true;
        }

        if (slide.type === slidesTypes.START) {
            return false; // Это стартовый слайд
        }

        if (slide.hidden) {
            return false; // Это скрытый слайд
        }

        if (this.isSlideComplete(slide)) {

            return false; // Пройденный слайд (не заблокирован)

        } else {

            const previousSlide = SlideProvider.previous(slide);

            if (!previousSlide) {
                return false; // Это первый слайд
            }

            if (previousSlide.type === slidesTypes.START) {
                return false; // Это первый слайд после стартового
            }

            if (this.isSlideComplete(previousSlide)) {
                return false; // Следующий слайд после пройденного
            }

            if (this.activity && this.activity.slide === previousSlide.uuid && SlideProvider.isStatic(previousSlide)) {
                return false; // Это следующий слайд после текущего статичного активного
            }

        }

        return true;

    }

    // Обрабатывает все ссылки и вешает на них событие перехода
    //
    public processLinks(host: ElementRef) {

        const allLinks = Links.get(host.nativeElement);

        for (const link of allLinks) {
            if (link.internal) {
                link.element.addEventListener("click",
                    (event) => {
                        event.preventDefault();
                        this.goToLink(link.href);
                    },
                    false
                );
            } else {
                link.element.setAttribute('target', '_blank');
            }
        }

    }

    // Переходит по ссылке
    //
    public goToLink(href: string) {

        if (environment.displayLog) {
            console.log("Link HREF:", href)
        }

        const linkParams = OBJECTS.paramsToObject(href);

        // Ищем идентификатор слайда

        let uuidSlide = "";
        let uuidPage = "";
        let glossary = "";
        let glossaryTerm = "";

        if ("links" in this.courseData) {
            const linkData = this.courseData.links.find(
                (linkHREF) => linkHREF.href === href
            );
            if (linkData) {
                uuidSlide = linkData.slide;
            }
        }

        if (!uuidSlide) {
            if (linkParams && 'item' in linkParams) {
                const tocElement = CourseDataProvider.findTocElement(undefined, linkParams.id);
                if (tocElement) {
                    uuidSlide = tocElement.slide;
                }
            }
        }

        if (!uuidSlide) {
            if (linkParams && 'id' in linkParams && 'object' in linkParams) {
                if (linkParams.object === 'term') {
                    glossaryTerm = linkParams.id;
                    glossary = courseData.glossary;
                } else {
                    const tocElement = CourseDataProvider.findTocElement(linkParams.id);
                    if (tocElement) {
                        uuidSlide = tocElement.slide;
                    }
                }
            }
        }

        if (linkParams && 'idGroup' in linkParams) {
            uuidPage = linkParams.idGroup;
        }

        if (linkParams && "term" in linkParams && "glossary" in linkParams) {
            glossary = linkParams.glossary;
            glossaryTerm = linkParams.term;
        }

        if (environment.displayLog) {
            console.log("Go to slide:", uuidSlide)
        }

        if (uuidSlide) {
            this.goToSlide(uuidSlide, uuidPage); // Открываем слайд
        }

        if (glossary && glossaryTerm) {
            this.openGlossaryTerm(glossary, glossaryTerm);
        }

    }

    // Переходит к нужному слайду
    //
    public goToSlide(uuidSlide: string,  uuidPage?: string, modalWindowSettings?: ModalWindowSettings) {

        const standardProcessing: StandardProcessingInterface = {
            standard: true
        };

        this.api.beforeOpenSlide(uuidSlide, standardProcessing);

        if (!standardProcessing.standard) {
            return; // Ссылку обработает API
        }

        const slide: SlideDataInterface = SlideProvider.find(uuidSlide);

        if (SlideProvider.emptySlide(slide)) {
            this.ep.err({
                code: errorCodes.SLIDE_NOT_FOUND,
                console: `Slide ${uuidSlide} not found`
            });
            return;
        }

        if (!modalWindowSettings && this.isSlideDisabled(slide)) {
            this.ep.err({
                code: errorCodes.SLIDE_IS_DISABLED,
                console: `Slide ${uuidSlide} is disabled`
            });
            return;
        }

        const currentSlide = (this.activity) ? SlideProvider.find(this.activity.slide) : undefined; // Текущий слайд

        if (modalWindowSettings || slide.hidden || (currentSlide && SlideProvider.isHidden(currentSlide))) {
            this.mp.open({
                type: modalTypes.SLIDE,
                slide: slide,
                slideToRestoreAfterClose: (currentSlide) ? currentSlide.uuid : "",
                hideCloseButton: (modalWindowSettings) ? modalWindowSettings.hideCloseButton : false,
                maximizeSize: (modalWindowSettings) ? modalWindowSettings.maximizeSize : false,
                title: (modalWindowSettings) ? modalWindowSettings.title : ""
            });
        } else {
            if (!WINDOW.tabletLandscapeUp() && (!this.activity || slide.uuid !== this.activity.slide)) {
                // Закрываем содержание, если оно размещено поверх контента.
                this.onChangeTocVisibility.next(false);
            }
            if (uuidPage) {
                this.router.navigate(['/course', 'slide', slide.uuid, 'page', uuidPage], {});
            } else {
                this.router.navigate(['/course', 'slide', slide.uuid], {});
            }

        }

    }

    public reload() {
        this.router.navigate(['/course'], { replaceUrl: true }).then(() => {
            this.goToSlide(this.sp.activeSlide.uuid);
        });
    }

    public openGlossaryTerm(glossary: string, term: string) {

        let slide: GlossarySlideDataInterface = SlideProvider.find(glossary) as GlossarySlideDataInterface;

        if (SlideProvider.emptySlide(slide)) {
            alert(`Glossary "${glossary}" not found`);
            return;
        }

        const termData: TermDataInterface = slide.glossary.terms.find((t) => t.uuid === term);

        if (!termData) {
            alert(`Term "${term}" not found`);
            return;
        }

        this.mp.open({
            type: modalTypes.TERM,
            term: termData
        });

    }

    public closeCommandIsAvailable(): boolean {
        return this.api.closeCommandIsAvailable();
    }

    public historyCommandsIsAvailable(): boolean {
        return this.api.historyCommandsIsAvailable();
    }

    public glossaryCommandIsAvailable(): boolean {
        return Terms.glossaryCommandAvailable(this.courseData);
    }

    public homeCommandIsAvailable(): boolean {
        return !!SlideProvider.start();
    }

    public bookmarksCommandIsAvailable(): boolean {
        if (SlideProvider.isSingleSlide()) {
            return false;
        }
        return true;
    }

    public checkBookmark(): void {

        // Проверки

        const activeSlide: string = this.sp.activeSlide.uuid;

        if (!activeSlide) {
            return;
        }

        //  Создаем пустой массив закладок, если его нет

        if (!("bookmarks" in this.learning) || !this.learning.bookmarks) {
            this.learning.bookmarks = {
                elements: []
            };
        }

        // Добавляем или удаляем закладки

        const bookmarks = this.learning.bookmarks;

        const bookmarkIndex = bookmarks.elements.findIndex((el) => el.slide === activeSlide);

        if (bookmarkIndex > -1) {
            bookmarks.elements.splice(bookmarkIndex, 1);
        } else {
            bookmarks.elements.push({
                slide: activeSlide
            });
        }

        // Вызываем события

        this.onChangeBookmarks.next(bookmarks);
        this.api.save(this.learning, [], false, false); // TODO: работает только для api V8, SCORM, LOCAL.

    }


    public bookmarkIsActive(slide: string): boolean {
        if (("bookmarks" in this.learning) && this.learning.bookmarks) {
            return (this.learning.bookmarks.elements.findIndex((el) => el.slide === slide) > -1);
        } else {
            return false;
        }
    }

    public close(): void {
        this.closed = true;
        this.onClose.next();
        this.onunload(false);
    }

    private onunload(isUnload: boolean) {
        const activities = this.beforeCloseApp();
        this.api.save(this.learning, activities, true, isUnload);
    }

    public saveScrollPosition(slide: string, position: number): void {
        this.scrollPositions[slide] = position;
    }

    public getScrollPosition(slide): number {
        return (slide in this.scrollPositions) ? this.scrollPositions[slide] : 0;
    }

    // Тип активности
    //
    private static typeActivity(slide: SlideDataInterface): ActivitiesTypes {
        if (SlideProvider.isStatic(slide)) {
            return activitiesTypes.STATIC;
        } else if (slide.type === slidesTypes.QUIZ) {
            return activitiesTypes.QUIZ;
        } else if (slide.type === slidesTypes.SCO) {
            return activitiesTypes.SCO;
        } else {
            console.error("Unknown activity type: %s", slide.type);
        }
    }

}