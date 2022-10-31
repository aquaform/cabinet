import {Component, Input, OnChanges, OnDestroy, OnInit} from "@angular/core";
import {
    QuestionDataInterface,
    QuestionMapElementInterface
} from "../../../../interface/data-interface/slides/question-data.interface";
import {QuizDataProvider} from "../../../../data/quiz/quiz-data.provider";
import {
    QuestionAnswerVariantInterface,
    QuestionAnswerInterface
} from "../../../../interface/learning-interface/quiz/question-answer.interface";
import {questionZoomValue, QuestionZoomValue} from "../question.zoom";
import {animate, style, transition, trigger} from "@angular/animations";
import {CourseDataProvider} from "../../../../data/course-data.provider";
import {ContentDataInterface} from "../../../../interface/data-interface/course-data.interface";

const animationDuration: number = 200;

@Component({
    selector: "mapping-variants",
    templateUrl: "mapping-variants.component.html",
    styleUrls: ["mapping-variants.component.scss"],
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

export class MappingVariantsQuestionComponent implements OnInit, OnDestroy, OnChanges {

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

    selectVariant(variant: QuestionAnswerVariantInterface, element: QuestionMapElementInterface) {
        if (this.readonly) {
            return;
        }
        const elementIndex = variant.mapElementsSelected.indexOf(element.uuid);
        if (elementIndex > -1) {
            variant.mapElementsSelected.splice(elementIndex, 1);
        } else {
            variant.mapElementsSelected.push(element.uuid);
        }
    }

    isSelected(variant: QuestionAnswerVariantInterface, element: QuestionMapElementInterface): boolean {
        return variant.mapElementsSelected.indexOf(element.uuid) > -1;
    }

    isCorrect(variant: QuestionAnswerVariantInterface, element: QuestionMapElementInterface): boolean {
        return QuizDataProvider.isVariantCorrectInMap(this.dataQuestion, variant.variant, element.uuid);
    }

    titleText(title: ContentDataInterface): string {
        return CourseDataProvider.getData(title);
    }

    textVariant(variant: QuestionAnswerVariantInterface): string {
        return QuizDataProvider.textVariant(this.dataQuestion, variant.variant);
    }

    imageVariant(variant: QuestionAnswerVariantInterface): string {
        return QuizDataProvider.imageVariant(this.dataQuestion, variant.variant);
    }

    textElement(element: QuestionMapElementInterface): string {
        return QuizDataProvider.textMapElement(this.dataQuestion, element.uuid);
    }

    imageElement(element: QuestionMapElementInterface): string {
        return QuizDataProvider.imageMapElement(this.dataQuestion, element.uuid);
    }
}