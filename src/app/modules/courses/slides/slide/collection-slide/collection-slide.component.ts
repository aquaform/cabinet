import { AfterViewInit, Component, ElementRef, Input, OnChanges, QueryList, ViewChildren } from "@angular/core";
import { CollectionSlideDataInterface } from "../../../interface/data-interface/course-data.interface";
import {
    AudioCollectionElementDataInterface,
    CollectionElementDataInterface,
    collectionElementsTypes,
    PDFCollectionElementDataInterface,
    VideoCollectionElementDataInterface
} from "../../../interface/data-interface/slides/collection-data.interface";
import { QuestionAnswerProvider } from "../../../learning/interactive/question-answer/question-answer.provider";
import { QuestionDataInterface } from "../../../interface/data-interface/slides/question-data.interface";
import { QuestionAnswerInterface } from "../../../interface/learning-interface/quiz/question-answer.interface";
import { CourseDataProvider } from "../../../data/course-data.provider";
import { DOM } from "../../../tools/dom";
import { BROWSER } from "../../../tools/universal/browser";
import { LOCATION } from "../../../tools/universal/location";
import { AppComponentTemplate } from '@shared/component.template';
import { Observable, zip } from 'rxjs';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { Highlight } from '@modules/courses/tools/highlight';
import { Terms } from '@modules/courses/tools/terms';
import { LearningProvider } from '@modules/courses/learning/learning.provider';
import { Scroll } from '@modules/courses/tools/universal/scroll';
import { SearchProvider } from '@modules/courses/search/search.provider';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    selector: "collection-slide",
    templateUrl: "collection-slide.component.html",
    styleUrls: ["collection-slide.component.scss"]
})

export class CollectionSlideComponent extends AppComponentTemplate implements OnChanges, AfterViewInit {

    @Input() slide: CollectionSlideDataInterface; // Слайд с тестом
    @Input() uuidPage: string; // Идентификатор страницы

    elementsTypes = collectionElementsTypes; // Все типы слайдов
    path: string = CourseDataProvider.dataFolderPath();
    oldWebkit: boolean = BROWSER.oldWebkit();
    rndAdd: string;
    navVisibility = false;
    currentElement: CollectionElementDataInterface;

    @ViewChildren('htmlContainer') htmlContainer: QueryList<ElementRef>; // Контейнер для вставки HTML

    questionAnswers: QuestionAnswerInterface[] = [];

    constructor(
        private el: ElementRef,
        private err: ErrorsService,
        private lp: LearningProvider,
        private sh: SearchProvider,
        private router: Router) {

        super();
        this.rndAdd = LOCATION.rndAdd();

    }

    ngOnInit() {

        this.navVisibility = this.slide.collection.elements.length > 1;

        if (!this.uuidPage) {
            this.uuidPage = this.slide.collection.elements[0].uuid;
        }

        for (const element of this.slide.collection.elements) {
            if (element.type === this.elementsTypes.HTML && element.html) {
                element.html.url = CourseDataProvider.frameURL(element.html);
            }
        }

        this.currentElement = this.slide.collection.elements.find(val => val.uuid === this.uuidPage);

        // Создаем ответы на вопросы и помещаем их в активность слайда

        const questionsElements = this.slide.collection.elements.filter((element) => element.type === this.elementsTypes.QUESTION);

        for (const questionElement of questionsElements) {
            this.questionAnswers.push(
                QuestionAnswerProvider.newAnswer(questionElement.question)
            );
        }

    }

    ngAfterViewInit() {

        // Размещаем тексты текстовых элементов

        const all$: Observable<ElementRef>[] = [];

        for (const element of this.htmlContainer) {

            const elementUUID: string = element.nativeElement.getAttribute("uuid");
            if (!elementUUID) {
                return;
            }

            const collectionElement = this.slide.collection.elements.find(el => el.uuid === elementUUID);
            if (!collectionElement) {
                return;
            }

            all$.push(DOM.setInnerHTML(element, CourseDataProvider.getData(collectionElement.text)));

        }

        zip(...all$)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (textElements) => {
                    DOM.setImageSize(this.el);
                    DOM.setResHref(this.el);
                    for (const textElement of textElements) {
                        Highlight.mark(textElement.nativeElement, this.sh.highlightWords());
                        Terms.makeLinks(textElement.nativeElement);
                    }
                    this.lp.processLinks(this.el);
                    Scroll.scrollToElementPosition(this.el, this.lp.getScrollPosition(this.slide.uuid));
                },
                (err) => this.err.register(err)
            );

    }

    ngOnChanges() {
    }

    ngOnDestroy() {
    }

    // Ищет ответ на вопрос
    //
    answerQuestion(question: QuestionDataInterface): QuestionAnswerInterface {
        return this.questionAnswers.find((answer) => answer.question === question.uuid);
    }

    goToPage(element: CollectionElementDataInterface): false {
        this.router.navigate(['/course', 'slide', this.slide.uuid, 'page', element.uuid]);
        return false;
    }

    // Последовательный режим - это когда
    // элементы располагаются последовательно друг
    // под другом в той высоте, который они занимают.
    // В противном случае элемент располагается один на странице
    // и занимает ее полную высоту.
    sequenceMode(): boolean {

        if (this.navVisibility) {
            return false;
        }

        if (this.slide.collection.elements.length < 2) {
            return false;
        }

        return true;

    }

    get PDFCurrentElement(): PDFCollectionElementDataInterface {
        return (this.currentElement && this.currentElement.type === this.elementsTypes.PDF) ?
            this.currentElement as PDFCollectionElementDataInterface : undefined;
    }

    get VideoCurrentElement(): VideoCollectionElementDataInterface {
        return (this.currentElement && this.currentElement.type === this.elementsTypes.VIDEO) ?
            this.currentElement as VideoCollectionElementDataInterface : undefined;
    }

    get AudioCurrentElement(): AudioCollectionElementDataInterface {
        return (this.currentElement && this.currentElement.type === this.elementsTypes.AUDIO) ?
            this.currentElement as AudioCollectionElementDataInterface : undefined;
    }


}

