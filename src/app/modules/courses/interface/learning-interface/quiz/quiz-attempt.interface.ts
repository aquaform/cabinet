import {QuestionAnswerInterface} from "./question-answer.interface";

/**
 * Created by Baranoshnikov on 24.04.2017.
 */

export interface QuizAttemptInterface {
    uuid: string;
    slide: string; // Идентификатор слайда с тестом
    quiz: string; // Идентификатор шаблона теста
    complete: boolean;
    start: Date;
    end: Date;
    score: number;
    pages: PageQuizAttemptInterface[];
}

export interface PageQuizAttemptInterface {
    uuid: string;
    questions: QuestionAnswerInterface[];
}

