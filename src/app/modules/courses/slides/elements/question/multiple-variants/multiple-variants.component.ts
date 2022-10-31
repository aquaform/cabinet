
import {Component, Input, OnChanges, OnDestroy, OnInit} from "@angular/core";
import {QuestionDataInterface} from "../../../../interface/data-interface/slides/question-data.interface";
import {QuizDataProvider} from "../../../../data/quiz/quiz-data.provider";
import {
    QuestionAnswerVariantInterface,
    QuestionAnswerInterface
} from "../../../../interface/learning-interface/quiz/question-answer.interface";
import {QuestionZoomValue, questionZoomValue} from "../question.zoom";

@Component({
    selector: "multiple-variants",
    templateUrl: "multiple-variants.component.html",
    styleUrls: ["multiple-variants.component.scss"]
})

export class MultipleVariantsQuestionComponent implements OnInit, OnDestroy, OnChanges {

    @Input() readonly: boolean;
    @Input() zoom: QuestionZoomValue;
    @Input() quizQuestion: QuestionAnswerInterface; // Вопрос в тесте
    @Input() dataQuestion: QuestionDataInterface; // Данные вопроса (шаблон)
    @Input() isKey: boolean; // Надо показать ключ (правильные ответы)

    zoomValue = questionZoomValue;

    constructor() {
    }

    ngOnInit() {
    }

    ngOnChanges() {
    }

    ngOnDestroy() {
    }

    selectVariant(variant: QuestionAnswerVariantInterface) {
        if (this.readonly) {
            return;
        }
        variant.selected = !variant.selected;
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

}

