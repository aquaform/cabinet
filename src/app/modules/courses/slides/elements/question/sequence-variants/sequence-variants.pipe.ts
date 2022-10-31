import {Pipe, PipeTransform} from "@angular/core";
import {QuestionAnswerVariantInterface} from "../../../../interface/learning-interface/quiz/question-answer.interface";
import {QuestionDataInterface} from "../../../../interface/data-interface/slides/question-data.interface";
import {QuizDataProvider} from "../../../../data/quiz/quiz-data.provider";

@Pipe({ name: 'sortByKey' })
export class SortVariantsByKeyPipe implements PipeTransform {
    transform(variants: QuestionAnswerVariantInterface[], questionData: QuestionDataInterface, isKey: boolean) {
        if (!isKey) {
            // Ничего не делаем, так как надо сортировать по ключу.
            return variants;
        } else {
            // Делаем копию массива вариантов ответа и сортируем его по индексу.
            // Делать копию через slice необходимо, так как сортировка "живого"
            // массива ответов собъет реальный ответ пользователя.
            return variants.slice().sort((a, b) => {
                const indexA: number = QuizDataProvider.indexVariant(questionData, a.variant);
                const indexB: number = QuizDataProvider.indexVariant(questionData, b.variant);
                if (indexA < indexB) {
                    return -1;
                }
                if (indexA > indexB) {
                    return 1;
                }
                return 0;
            })
        }
    }
}