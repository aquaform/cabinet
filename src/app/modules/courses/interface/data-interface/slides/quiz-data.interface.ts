import {QuestionDataInterface} from "./question-data.interface";

//////////////////////////////////////////////////////////////////////////////////
// ТЕСТЫ

// Данные теста
//
export interface QuizDataInterface {
    uuid: string;
    questions: QuestionDataInterface[];
    level: QuizLevelInterface;
    countAttempts: number;
    displayQuestionResults: boolean; // Показывать ответ на вопрос
    allowCorrectMistakes: boolean; // Разрешить исправлять ошибки
    randomizeQuestions: boolean; // Перемешивать вопросы
    displayFinalStatistic: boolean; // Показывать финальную статистику
    displayKeys: boolean; // Показывает ключи правильных ответов после теста
}

// Сложность теста, в которой описывается как подбирать вопросы и время на его прохождение
//
export interface QuizLevelInterface {
    countQuestions?: number; // Количество вопросов
    timePeriod: number; // Общее время на тест
}