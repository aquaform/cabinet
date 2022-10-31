
import {
    AfterViewChecked,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from "@angular/core";
import {QuestionDataInterface, questionsTypes} from "../../../interface/data-interface/slides/question-data.interface";
import {CourseDataProvider} from "../../../data/course-data.provider";
import {QuestionAnswerInterface, QuestionAnswerInputInterface} from "../../../interface/learning-interface/quiz/question-answer.interface";
import {QuestionAnswerProvider} from "../../../learning/interactive/question-answer/question-answer.provider";
import {DOM} from "../../../tools/dom";
import {QuestionZoomValue, questionZoomValue, QuestionZoom} from "./question.zoom";
import {LearningProvider} from "../../../learning/learning.provider";
import {BROWSER} from "../../../tools/universal/browser";
import { QuizDataProvider } from "../../../data/quiz/quiz-data.provider";
import { ModalWindowSettings } from "@modules/courses/modal/modal.interface";
import { takeUntil } from "rxjs/operators";
import { AppComponentTemplate } from "@shared/component.template";

@Component({
    selector: "question",
    templateUrl: "question.component.html",
    styleUrls: ["question.component.scss"]
})

export class QuestionComponent extends AppComponentTemplate implements OnInit, OnDestroy, OnChanges, AfterViewChecked {

    @Input() readonly: boolean; // Если true, то нельзя отвечать на вопрос
    @Input() onlySingleQuestions: boolean; // Во всем тесте только блиц-вопросы без кнопки "Подтвердить ответ"
    @Input() answerQuestion: QuestionAnswerInterface; // Вопрос в тесте (ответ на вопрос)
    @Input() dataQuestion: QuestionDataInterface; // Данные вопроса (шаблон вопроса)
    @Input() showNext: boolean; // Показывать кнопку "Следующий вопрос"
    @Input() showResult: boolean; // Показывать область ответа
    @Input() showKey: boolean; // Доступна кнопка показа правильного ответа (ключа)
    @Input() forStatistic: boolean; // Вопрос показывается на странице статистики (не в тесте)
    @Input() isLastPage: boolean;

    @Output() goToIncompletePage = new EventEmitter();

    @ViewChild('taskContainer', { static: true }) taskContainer: ElementRef; // Элемент HTML для размещения задания вопроса
    oldWebkit: boolean = BROWSER.oldWebkit();

    questionsTypes = questionsTypes;
    questionZoom = questionZoomValue;

    zoom: QuestionZoomValue = questionZoomValue.NONE;
    shortTask: boolean = false;
    showConfirm: boolean = true; // Показывать кнопку "Подтвердить ответ"
    showHelp: boolean = false;
    isKey: boolean = false; // Сейчас показывается правильный ответ (ключ)
    clientWidth: number;
    isImageWithArea: boolean;
    path: string = CourseDataProvider.dataFolderPath();

    constructor(private qp: QuestionAnswerProvider, private el: ElementRef, private lp: LearningProvider) {
        super();
    }

    ngOnInit() {

        this.isImageWithArea = QuizDataProvider.isImageWithArea(this.dataQuestion);
        this.clientWidth = this.el.nativeElement.parentElement.clientWidth;

        if (!this.answerQuestion) {
            console.error("No answer question");
            return;
        }

        if (!this.dataQuestion) {
            console.error("No data question");
            return;
        }

        for (let variant of this.dataQuestion.variants) {
            if (variant.image) {
                this.zoom = questionZoomValue.OFF; // Нужен зум
            }
        }

        if (this.isImageWithArea) {
            this.zoom = questionZoomValue.OFF; // Нужен зум
        }

        this.showConfirm = (this.dataQuestion.type !== questionsTypes.SINGLE) ? true : !this.onlySingleQuestions;
        this.showConfirm = this.isImageWithArea ? false : this.showConfirm;
        this.showConfirm = (this.forStatistic) ? false : this.showConfirm;

        if (!this.answerQuestion.complete || this.answerQuestion.score === 100) {
            // Для неотвеченных вопросов или отвеченных верно нет смысла показывать ключ
            this.showKey = false;
        }

        this.showHelp = (this.dataQuestion.help && !this.forStatistic);

    }

    ngOnChanges() {

        let task = CourseDataProvider.getData(this.dataQuestion.task);

        // Помещаем в задания поля для ввода ответов
        if (this.dataQuestion.type === questionsTypes.INPUT) {
            const inputs = QuizDataProvider.allInputs(this.dataQuestion);
            for (const inputUUID of inputs) {
                task = task.split(`[[${inputUUID}]]`)
                    .join(`<input type="text" id="${this.inputElementId(inputUUID)}" value="" autocomplete="off"></input>`);
            }
        }

        DOM.setInnerHTML(this.taskContainer, task).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {

            DOM.setImageSize(this.taskContainer, this.el, this.clientWidth);
            DOM.setResHref(this.taskContainer);
            this.lp.processLinks(this.taskContainer);

            if (this.dataQuestion.type === questionsTypes.INPUT) {
                const inputs = QuizDataProvider.allInputs(this.dataQuestion);
                for (const inputUUID of inputs) {
                    const inputElement = document.getElementById(this.inputElementId(inputUUID)) as HTMLInputElement;
                    if (inputElement) {
                        const answerInput = this.answerQuestion.inputs.find((a) => a.input === inputUUID);
                        if (answerInput) {
                            inputElement.value = answerInput.text;
                        }
                        if (this.readonly) {
                            inputElement.disabled = true;
                        }
                    }
                }
            }

        });

        this.shortTask = (task.split(" ").length < 3); // одно или два слова в задании

    }

    ngAfterViewChecked() {
    }

    ngOnDestroy() {
    }

    @HostListener('window:resize', ['$event'])
    onResize($event) {
        DOM.setImageSize(this.taskContainer, this.el, this.clientWidth);
    }

    clear() {
        this.qp.clear(this.answerQuestion, this.dataQuestion);
        // Примечание: процедура не очищает введенные значения в INPUT (пока это не надо)
    }

    // Обрабатываем ответ на вопрос
    //
    submit() {

        if (this.dataQuestion.type === questionsTypes.INPUT) {
            const inputs = QuizDataProvider.allInputs(this.dataQuestion);
            for (let inputUUID of inputs) {
                let inputElement = document.getElementById(this.inputElementId(inputUUID)) as HTMLInputElement;
                if (inputElement) {
                    let curInputAnswer = this.answerQuestion.inputs.find((e) => e.input === inputUUID);
                    if (curInputAnswer) {
                        curInputAnswer.text = inputElement.value.trim();
                    } else {
                        this.answerQuestion.inputs.push({
                            input: inputUUID,
                            text: inputElement.value.trim()
                        } as QuestionAnswerInputInterface);
                    }
                }
            }
        }

        this.qp.complete(this.answerQuestion, this.dataQuestion);

    }

    displayHelp() {
        this.clear();
        const modalSettings: ModalWindowSettings = {maximizeSize: true, hideCloseButton: false};
        this.lp.goToSlide(this.dataQuestion.help.slide, "", modalSettings);
    }

    switchZoom() {
        this.zoom = QuestionZoom.switchValue(this.zoom);
    }

    nextQuestion() {
        this.goToIncompletePage.emit();
    }

    switchDisplayKey() {

        this.isKey = !this.isKey;

        if (this.dataQuestion.type === questionsTypes.INPUT) {
            const inputs = QuizDataProvider.allInputs(this.dataQuestion);
            for (let inputUUID of inputs) {
                let inputElement = document.getElementById(this.inputElementId(inputUUID)) as HTMLInputElement;
                if (inputElement) {
                    if (this.isKey) {
                        let variantInput = this.dataQuestion.variants.find((v) => v.input === inputUUID);
                        if (variantInput) {
                            inputElement.value = QuizDataProvider.textVariant(this.dataQuestion, variantInput.uuid);
                        } else {
                            inputElement.value = '';
                        }
                    } else {
                        let answerInput = this.answerQuestion.inputs.find((a) => a.input === inputUUID);
                        if (answerInput) {
                            inputElement.value = answerInput.text;
                        }
                    }
                }
            }
        }

    }

    inputElementId(inputUUID: string) {
        return `${this.dataQuestion.uuid}-${inputUUID}`;
    }


    get mayBeScore(): boolean {
        return this.dataQuestion && this.dataQuestion.type !== questionsTypes.TEXT;
    }

    get displayCorrect(): boolean {
        return this.mayBeScore && !this.displayKey && this.answerQuestion.complete && this.answerQuestion.score === 100;
    }

    get displayError(): boolean {
        return this.mayBeScore && !this.displayKey && this.answerQuestion.complete && this.answerQuestion.score === 0;
    }

    get displayScore(): boolean {
        return this.mayBeScore && !this.displayKey && this.answerQuestion.complete && this.answerQuestion.score > 0 && this.answerQuestion.score < 100;
    }

    get displayKey(): boolean {
        return this.mayBeScore && this.isKey;
    }

    get displayWillBeCheck(): boolean {
        return !this.mayBeScore && this.answerQuestion.complete;
    }

    get displayEmpty(): boolean {
        if (this.displayCorrect) {
            return false;
        }
        if (this.displayError) {
            return false;
        }
        if (this.displayScore) {
            return false;
        }
        if (this.displayKey) {
            return false;
        }
        if (this.displayWillBeCheck) {
            return false;
        }
        return true;
    }



}

