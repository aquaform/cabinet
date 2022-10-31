import {Component, Input, OnChanges, OnDestroy, OnInit, EventEmitter, Output} from "@angular/core";
import {QuestionDataInterface} from "../../../../interface/data-interface/slides/question-data.interface";
import {QuizDataProvider} from "../../../../data/quiz/quiz-data.provider";
import {
    QuestionAnswerVariantInterface,
    QuestionAnswerInterface
} from "../../../../interface/learning-interface/quiz/question-answer.interface";
import {QuestionZoomValue, questionZoomValue} from "../question.zoom";

@Component({
    selector: "single-variants",
    templateUrl: "single-variants.component.html",
    styleUrls: ["single-variants.component.scss"]
})

export class SingleVariantsQuestionComponent implements OnInit, OnDestroy, OnChanges {

    @Input() readonly: boolean;
    @Input() zoom: QuestionZoomValue;
    @Input() quizQuestion: QuestionAnswerInterface; // Вопрос в тесте
    @Input() dataQuestion: QuestionDataInterface; // Данные вопроса (шаблон)
    @Input() showConfirm: boolean; // Доступна кнопка "Подтвердить ответ"
    @Input() isKey: boolean; // Надо показать ключ (правильные ответы)

    @Output() submit = new EventEmitter();

    zoomValue = questionZoomValue;
    short: boolean = false; // Короткий текст варианта (будет большой шрифт)

    constructor() {
    }

    ngOnInit() {
        this.short = this.onlyShortVariants();
    }

    ngOnChanges() {
    }

    ngOnDestroy() {
    }

    selectVariant(variant: QuestionAnswerVariantInterface) {
        if (this.readonly) {
            return;
        }
        for (let curVariant of this.quizQuestion.variants) {
            curVariant.selected = false; // Сбрасываем выбор всех вариантов
        }
        variant.selected = true;
        if (!this.showConfirm) {
            this.submit.emit();
        }
    }

    textVariant(variant: QuestionAnswerVariantInterface) {
        return QuizDataProvider.textVariant(this.dataQuestion, variant.variant);
    }

    imageVariant(variant: QuestionAnswerVariantInterface): string {
        return QuizDataProvider.imageVariant(this.dataQuestion, variant.variant);
    }

    isCorrect(variant: QuestionAnswerVariantInterface): boolean {
        return QuizDataProvider.dataVariant(this.dataQuestion, variant.variant).correct;
    }

    private onlyShortVariants(): boolean {

        if (this.showConfirm) {
            return false;
        }

        if (this.zoom !== this.zoomValue.NONE) {
            return false;
        }

        for (let variant of this.quizQuestion.variants) {
            if (this.imageVariant(variant)) {
                return false;
            }
            if (this.textVariant(variant).length > 2) {
                return false;
            }
        }

        return true;

    }

}