import {CourseDataProvider} from "../course-data.provider";
import {
    QuestionDataInterface,
    QuestionMapElementInterface,
    QuestionVariantDataInterface
} from "../../interface/data-interface/slides/question-data.interface";
import {QuizDataInterface} from "../../interface/data-interface/slides/quiz-data.interface";
import { Injectable } from "@angular/core";

@Injectable()
export class QuizDataProvider {

    constructor() {
    }

    // Вопрос по uuid
    //
    public static findQuestion(quiz: QuizDataInterface, question_uuid: string): QuestionDataInterface {
        return quiz.questions.find((question) => question.uuid === question_uuid);
    }

    // Вариант ответа по uuid
    //
    public static dataVariant(questionData: QuestionDataInterface , variant_uuid: string): QuestionVariantDataInterface {
        return questionData.variants.find((variant) => variant.uuid === variant_uuid);
    }

    // Текст варианта ответа
    //
    public static textVariant(questionData: QuestionDataInterface, variant_uuid: string): string {
        return CourseDataProvider.getData(QuizDataProvider.dataVariant(questionData, variant_uuid).text);
    }

    // Индекс варианта
    //
    public static indexVariant(questionData: QuestionDataInterface, variant_uuid: string): number {
        return questionData.variants.findIndex((variant) => variant.uuid === variant_uuid);
    }

    // Картинка варианта ответа
    //
    public static imageVariant(questionData: QuestionDataInterface, variant_uuid: string): string {
        const dataVariant = QuizDataProvider.dataVariant(questionData, variant_uuid);
        if ("image" in dataVariant && dataVariant.image) {
            return CourseDataProvider.dataFolderPath() + dataVariant.image.path;
        } else {
            return "";
        }
    }

    // Элемент карты по uuid
    //
    public static dataMapElement(questionData: QuestionDataInterface, element_uuid: string): QuestionMapElementInterface {
        return questionData.map.elements.find((element) => element.uuid === element_uuid);
    }

    // Текст элемента карты
    //
    public static textMapElement(questionData: QuestionDataInterface, element_uuid: string): string {
        return CourseDataProvider.getData(QuizDataProvider.dataMapElement(questionData, element_uuid).text);
    }

    // Возвращает картинку вопроса с областями для выбора вариантов или null
    //
    public static isImageWithArea(questionData: QuestionDataInterface): boolean {
        return (!!questionData.image && !!questionData.image.areas);
    }

    // Картинка элемента карты
    //
    public static imageMapElement(questionData: QuestionDataInterface, element_uuid: string): string {
        let dataElement = QuizDataProvider.dataMapElement(questionData, element_uuid);
        if ("image" in dataElement && dataElement.image) {
            return CourseDataProvider.dataFolderPath() + dataElement.image.path;
        } else {
            return "";
        }
    }

    // Определяет является ли соответствие варианта и элемента верным
    //
    public static isVariantCorrectInMap(questionData: QuestionDataInterface, variant_uuid: string, element_uuid: string): boolean {
        let mapElement = questionData.map.elements.find((el) => el.uuid === element_uuid);
        return mapElement.variants.indexOf(variant_uuid) > -1;
    }

    // Получает все поля ввода, которые есть в вопросе
    //
    public static allInputs(questionData: QuestionDataInterface): string[] {
        const inputs: string[] = [];
        for (let variant of questionData.variants) {
            if (inputs.indexOf(variant.input) === -1) {
                inputs.push(variant.input);
            }
        }
        return inputs;
    }

}