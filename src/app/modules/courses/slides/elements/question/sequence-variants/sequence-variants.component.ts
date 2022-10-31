import {Component, Input, OnChanges, OnDestroy, OnInit} from "@angular/core";
import {QuestionDataInterface} from "../../../../interface/data-interface/slides/question-data.interface";
import {QuizDataProvider} from "../../../../data/quiz/quiz-data.provider";
import {
    QuestionAnswerVariantInterface,
    QuestionAnswerInterface
} from "../../../../interface/learning-interface/quiz/question-answer.interface";
import {questionZoomValue, QuestionZoomValue} from "../question.zoom";
import {animate, style, transition, trigger} from "@angular/animations";

const animationDuration: number = 200;

@Component({
    selector: "sequence-variants",
    templateUrl: "sequence-variants.component.html",
    styleUrls: ["sequence-variants.component.scss"],
    animations: [
        trigger('onMove', [
            transition('* => down', [
                style({transform: 'translateY(-100%)'}),
                animate(animationDuration)
            ]),
            transition('* => up', [
                style({transform: 'translateY(100%)'}),
                animate(animationDuration)
            ])

        ])
    ]
})

export class SequenceVariantsQuestionComponent implements OnInit, OnDestroy, OnChanges {

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

    up(variant: QuestionAnswerVariantInterface): void {

        if (this.readonly) {
            return;
        }

        let index = this.quizQuestion.variants.indexOf(variant);

        if (index > 0) {

            let element1 = this.quizQuestion.variants[index];
            let element2 = this.quizQuestion.variants[index - 1];

            this.quizQuestion.variants[index - 1] = element1;

            this.quizQuestion.variants[index] = element2;

            setTimeout(() => {
                element1.movedTo = 'up';
                element2.movedTo = 'down';
            });

        }

        setTimeout(() => {
            this.clearMove();
        }, animationDuration + 200);

    }

    down(variant: QuestionAnswerVariantInterface): void {

        if (this.readonly) {
            return;
        }

        let index = this.quizQuestion.variants.indexOf(variant);

        if (index < this.quizQuestion.variants.length - 1) {

            let element1 = this.quizQuestion.variants[index];
            let element2 = this.quizQuestion.variants[index + 1];

            this.quizQuestion.variants[index + 1] = element1;
            this.quizQuestion.variants[index] = element2;

            setTimeout(() => {
                element1.movedTo = 'down';
                element2.movedTo = 'up';
            });

        }

        setTimeout(() => {
            this.clearMove();
        }, animationDuration + 200);


    }

    textVariant(variant: QuestionAnswerVariantInterface) {
        return QuizDataProvider.textVariant(this.dataQuestion, variant.variant);
    }

    imageVariant(variant: QuestionAnswerVariantInterface): string {
        return QuizDataProvider.imageVariant(this.dataQuestion, variant.variant);
    }

    clearMove() {
        for (let variant of this.quizQuestion.variants) {
            delete variant.movedTo;
        }
    }

}