import {ContentDataInterface} from "../course-data.interface";
import {ImageDataInterface} from "./image-data.interface";

//////////////////////////////////////////////////////////////////////////////////
// ВОПРОСЫ

// Данные вопроса
//
export interface QuestionDataInterface {
    uuid: string;
    type: QuestionsTypes;
    task: ContentDataInterface;
    variants: QuestionVariantDataInterface[];
    weight?: number;
    map?: QuestionMapInterface;
    image?: ImageDataInterface;
    help?: {
        slide: string;
    };
}

// Типы вопросов
//
export type QuestionsTypes = "SINGLE" | "MULTIPLE" | "SEQUENCE" | "MAP" | "INPUT" | "TEXT";

export const questionsTypes = {
    SINGLE: "SINGLE" as QuestionsTypes,
    MULTIPLE: "MULTIPLE" as QuestionsTypes,
    SEQUENCE: "SEQUENCE" as QuestionsTypes,
    MAP: "MAP" as QuestionsTypes,
    INPUT: "INPUT" as QuestionsTypes,
    TEXT: "TEXT" as QuestionsTypes,
};

// Вариант ответа на вопрос
//
export interface QuestionVariantDataInterface {
    uuid: string;
    text: ContentDataInterface;
    correct: boolean;
    image: ImageDataInterface;
    input?: string; // Идентификатор поля для ввода
}

// Соответствие элементов и вариантов
//
export interface QuestionMapInterface {
    elementsTitle: ContentDataInterface;
    variantsTitle: ContentDataInterface;
    elements: QuestionMapElementInterface[];
}

// Элементы соответствия
//
export interface QuestionMapElementInterface {
    uuid: string;
    letter: string;
    text: ContentDataInterface;
    image: ImageDataInterface;
    variants: string[]; // Правильные варианты элемента
}