import { Injectable } from "@angular/core";
import { QuestionAnswerVariantInterface, QuestionAnswerInterface } from "../../../interface/learning-interface/quiz/question-answer.interface";
import { QuestionDataInterface, questionsTypes, QuestionVariantDataInterface } from "../../../interface/data-interface/slides/question-data.interface";
import { Subject } from "rxjs";
import { UUID } from "../../../tools/universal/uuid";
import { ARRAY } from "../../../tools/universal/array";
import { QuizDataProvider } from "../../../data/quiz/quiz-data.provider";

@Injectable({
    providedIn: 'root'
})
export class QuestionAnswerProvider {

    public onComplete: Subject<QuestionAnswerInterface>;

    constructor() {

    }

    public static newAnswer(questionData: QuestionDataInterface): QuestionAnswerInterface {

        let question: QuestionAnswerInterface = {
            uuid: UUID.get(),
            question: questionData.uuid,
            complete: false,
            score: 0,
            variants: [],
            inputs: [],
            start: new Date(),
            end: null,
            text: "",
            weight: (questionData.weight) ? questionData.weight : 1,
        };

        // Добавляем варианты ответов к вопросу

        if (questionData.type === questionsTypes.SINGLE
            || questionData.type === questionsTypes.MULTIPLE
            || questionData.type === questionsTypes.SEQUENCE
            || questionData.type === questionsTypes.MAP) {

            let indexVariants = ARRAY.index(questionData.variants.length);
            ARRAY.shuffle(indexVariants);

            for (let indexVariant of indexVariants) {
                let variant: QuestionAnswerVariantInterface = {
                    variant: questionData.variants[indexVariant].uuid,
                    selected: false,
                    mapElementsSelected: [],
                    trueSelected: false,
                    trueNotSelected: false,
                    falseSelected: false,
                    falseNotSelected: false,
                };
                question.variants.push(variant);
            }

        }

        return question;

    }

    init(ngUnsubscribe: Subject<void>) {
        this.onComplete = new Subject();
    }

    public clear(answer: QuestionAnswerInterface, dataQuestion: QuestionDataInterface) {
        answer.score = 0;
        answer.complete = false;
        answer.end = null;
        this.onComplete.next(answer);
    }

    // Завершает ответ на вопрос и считает результат
    //
    public complete(answer: QuestionAnswerInterface, dataQuestion: QuestionDataInterface) {

        answer.score = 0;

        switch (dataQuestion.type) {

            case questionsTypes.SINGLE: {

                let correctVariants: QuestionVariantDataInterface[] = dataQuestion.variants.filter((variant) => variant.correct);
                let selectedVariant: QuestionAnswerVariantInterface = answer.variants.find((variant) => variant.selected);

                let correctSelected: boolean = (
                    selectedVariant && !!correctVariants.find((variant) => variant.uuid === selectedVariant.variant)
                );

                answer.score = (correctSelected) ? 100 : 0;

                for (let answerVariant of answer.variants) {

                    if (answerVariant.selected) {
                        answerVariant.trueSelected = !!correctVariants.find((variant) => variant.uuid === answerVariant.variant);
                        answerVariant.falseSelected = !answerVariant.trueSelected;
                    } else {
                        answerVariant.trueNotSelected = !!correctVariants.find((variant) => variant.uuid === answerVariant.variant);
                        answerVariant.falseNotSelected = !answerVariant.trueNotSelected;
                    }

                }

                break;
            }

            case questionsTypes.MULTIPLE: {

                let correctVariants: QuestionVariantDataInterface[] = dataQuestion.variants.filter((variant) => variant.correct);
                let countCorrectVariants: number = dataQuestion.variants.filter((variant) => variant.correct).length;
                let notCorrectVariants: QuestionVariantDataInterface[] = dataQuestion.variants.filter((variant) => !variant.correct);
                let selectedVariants: QuestionAnswerVariantInterface[] = answer.variants.filter((variant) => variant.selected);

                let wrongSelected: boolean = false; // Выбраны ошибочные

                for (let notCorrectVariant of notCorrectVariants) {

                    if (!!selectedVariants.find((variant) => variant.variant === notCorrectVariant.uuid)) {
                        wrongSelected = true;
                        break;
                    }
                }

                // 100 баллов, когда количество верных совпадает с количеством неверных и не выбрано ни одного ошибочного.
                answer.score = (countCorrectVariants === selectedVariants.length && !wrongSelected) ? 100 : 0;

                for (let answerVariant of answer.variants) {

                    if (answerVariant.selected) {
                        answerVariant.trueSelected = !!correctVariants.find((variant) => variant.uuid === answerVariant.variant);
                        answerVariant.falseSelected = !answerVariant.trueSelected;
                    } else {
                        answerVariant.trueNotSelected = !!correctVariants.find((variant) => variant.uuid === answerVariant.variant);
                        answerVariant.falseNotSelected = !answerVariant.trueNotSelected;
                    }

                }

                break;
            }

            case questionsTypes.SEQUENCE: {

                let allCorrect: boolean = true;

                let correctSequence: string[] = []; // Верная последовательность вариантов

                for (let variant of dataQuestion.variants) {
                    if (answer.variants.findIndex((v) => v.variant === variant.uuid) === -1) {
                        continue; // Пропускаем варианты, которых нет в ответе
                    }
                    correctSequence.push(variant.uuid);
                }

                for (let curUUID of correctSequence) {

                    let correctIndex: number = correctSequence.indexOf(curUUID);

                    if (curUUID !== answer.variants[correctIndex].variant) {
                        allCorrect = false;
                        break;
                    }

                }

                answer.score = (allCorrect) ? 100 : 0;

                break;
            }

            case questionsTypes.MAP: {

                let allCorrect: boolean = true;

                for (let answerVariant of answer.variants) {
                    for (let mapElement of dataQuestion.map.elements) {
                        let isCorrect = QuizDataProvider.isVariantCorrectInMap(dataQuestion, answerVariant.variant, mapElement.uuid);
                        // Верный (isCorrect) означает, что данный вариант должен быть выбран у этого элемента соответствия
                        let isSelected: boolean = (answerVariant.mapElementsSelected.indexOf(mapElement.uuid) > -1);
                        // Выбранный (isSelected) означает, что элемент соответствия был выбран для данного варианта
                        if ((isSelected && !isCorrect) || (!isSelected && isCorrect)) {
                            allCorrect = false;
                            break;
                        }
                    }
                }

                answer.score = (allCorrect) ? 100 : 0;

                break;
            }

            case questionsTypes.INPUT: {

                const allInputs = QuizDataProvider.allInputs(dataQuestion);
                let allCorrect: boolean = true;

                for (let inputUUID of allInputs) {
                    let answerInput = answer.inputs.find((a) => a.input === inputUUID);
                    if (!answerInput) {
                        continue;
                    }
                    let textAnswer = answerInput.text.toLowerCase().trim();
                    let correctVariant = dataQuestion.variants.find((v) =>
                        QuizDataProvider.textVariant(dataQuestion, v.uuid).toLowerCase().trim() === textAnswer
                        && v.input === inputUUID
                    );
                    if (!correctVariant) {
                        allCorrect = false;
                    }
                }

                answer.score = (allCorrect) ? 100 : 0;

                break;

            }

            case questionsTypes.TEXT: {

                break;

            }

            default: {
                console.error("Unknown question type");
                break;
            }

        }

        answer.complete = true;
        answer.end = new Date;

        this.onComplete.next(answer);

    }


}