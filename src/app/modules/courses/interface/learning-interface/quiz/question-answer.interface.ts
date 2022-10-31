/**
 * Created by Baranoshnikov on 24.04.2017.
 */

export interface QuestionAnswerInterface {
    uuid: string;
    question: string; // Идентификатор шаблона вопроса
    complete: boolean;
    score: number;
    start: Date;
    end: Date;
    variants: QuestionAnswerVariantInterface[];
    inputs: QuestionAnswerInputInterface[]; // Ответы в полях ввода
    weight: number;
    text: string;
}

export interface QuestionAnswerInputInterface {
    input: string;
    text: string;
}

export interface QuestionAnswerVariantInterface {
    variant: string; // Идентификатор шаблона
    selected: boolean;
    mapElementsSelected: string[]; // Для каких элементов соответствия был выбран этот вариант
    trueSelected: boolean;
    trueNotSelected: boolean;
    falseSelected: boolean;
    falseNotSelected: boolean;
    movedTo?: string; // Триггер того, что  вариант менял положение. Не сохраняется в данных.
}