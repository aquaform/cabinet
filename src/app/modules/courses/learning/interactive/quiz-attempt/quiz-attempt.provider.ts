import {Injectable} from "@angular/core";
import {QuizAttemptInterface, PageQuizAttemptInterface} from "../../../interface/learning-interface/quiz/quiz-attempt.interface";
import {QuizSlideDataInterface} from "../../../interface/data-interface/course-data.interface";
import {Subject} from "rxjs";
import {QuestionAnswerProvider} from "../question-answer/question-answer.provider";
import {AlertProvider} from "../../../alert/alert.provider";
import {AlertInterface, alertStatus} from "../../../alert/alert.interface";
import {UUID} from "../../../tools/universal/uuid";
import {ARRAY} from "../../../tools/universal/array";
import { SlideProvider } from "@modules/courses/slides/slide/slide.provider";
import { questionsTypes } from "@modules/courses/interface/data-interface/slides/question-data.interface";

@Injectable({
    providedIn: 'root'
})
export class QuizAttemptProvider {

    public attempt: QuizAttemptInterface;
    public slide: QuizSlideDataInterface;
    public page: PageQuizAttemptInterface;

    public onStart: Subject<QuizAttemptInterface>;
    public onComplete: Subject<QuizAttemptInterface>;
    public onResume: Subject<QuizAttemptInterface>;
    public onTimeOver: Subject<QuizAttemptInterface>;

    constructor(private ap: AlertProvider) {

    }

    init(ngUnsubscribe: Subject<void>) {
        this.onStart = new Subject();
        this.onComplete = new Subject();
        this.onResume = new Subject();
        this.onTimeOver = new Subject();
    }

    // Создает новое прохождение теста
    //
    start(slide: QuizSlideDataInterface): QuizAttemptInterface {

        this.clear();

        // Создаем прохождение теста

        let quizAttempt: QuizAttemptInterface = {
            uuid: UUID.get(),
            slide: slide.uuid,
            quiz: slide.quiz.uuid,
            complete: false,
            start: new Date(),
            end: null,
            score: 0,
            pages: []
        };

        // Копируем список данных вопросов

        let indexQuestions = ARRAY.index(slide.quiz.questions.length);

        // Перемешиваем вопросы в случае, когда это явно указано в настройках,
        // или явно указано, что надо выбрать некоторое количество вопросов,
        // так как нет смысла выбирать не все вопросы в заданном порядке.

        if (slide.quiz.randomizeQuestions || slide.quiz.level.countQuestions > 0) {
            ARRAY.shuffle(indexQuestions);
        }

        // Добавляем каждый вопрос в активность

        let countQuestions = 0; // Сколько вопросов добавили в тест

        for (let indexQuestion of indexQuestions) {

            let questionData = slide.quiz.questions[indexQuestion];

            // Создаем новую страницу теста

            let page: PageQuizAttemptInterface = {
                uuid: questionData.uuid,
                questions: []
            };

            quizAttempt.pages.push(page);

            // Создаем новый вопрос на странице теста

            page.questions.push(QuestionAnswerProvider.newAnswer(questionData));

            // Считаем вопросы

            countQuestions++;

            // Прерываемся, если уже добавили все вопросы

            if (slide.quiz.level.countQuestions > 0 && countQuestions >= slide.quiz.level.countQuestions) {
                break;
            }

        }

        // Запоминаем данные попытки

        this.attempt = quizAttempt;
        this.slide = slide;

        // Вызываем событие начала тестирования.

        this.onStart.next(quizAttempt);

        // Показываем панель с информацией о ходе тестирования

        this.alert();

        // Возвращаем попытку

        return quizAttempt;

    }

    // Завершает тестирование
    //
    complete(quizAttempt: QuizAttemptInterface): void {

        const quizSlide = SlideProvider.find(quizAttempt.slide) as QuizSlideDataInterface;

        const isTextType = quizSlide.quiz.questions.findIndex(v => v.type === questionsTypes.TEXT) > -1;

        if (!quizAttempt.complete) {

            if (!isTextType) {
                let maxScore = 0;
                let realScore = 0;

                for (let page of quizAttempt.pages) {
                    realScore += QuizAttemptProvider.pageRealScore(page);
                    maxScore += QuizAttemptProvider.pageMaxScore(page);
                }
                quizAttempt.score = (maxScore > 0) ? Math.round((realScore / maxScore) * 100) : 0;
            } else {
                quizAttempt.score = 0;
            }

            quizAttempt.complete = true;
            quizAttempt.end = new Date();

            this.onComplete.next(quizAttempt); // Вызываем событие

        }

        this.clear();


    }

    // Восстанавливает сессию тестирования из общей активности
    //
    resume(quizAttempt: QuizAttemptInterface, slide: QuizSlideDataInterface): void {

        this.clear();

        this.slide = slide;
        this.attempt = quizAttempt;
        this.onResume.next(quizAttempt);
        this.alert();

    }

    // При изменении состояния теста (ответах на вопросы)
    //
    change(page: PageQuizAttemptInterface): void {
        this.page = page;
        this.alert();
    }

    // Перешли в другой слайд (покинули тест)
    //
    leave(): void {
       this.clear();
    }

    // Возвращает следующую страницу теста
    //
    nextPage(): PageQuizAttemptInterface {
        if (!this.attempt) {
            return undefined;
        }
        return this.attempt.pages.find((page) => {
            return !!(page.questions.find((question) => !question.complete));
        });
    }

    isLastPage(): boolean {

        if (!this.attempt || !this.attempt.pages.length || !this.page) {
            return false;
        }

        let numCurrentPage = 0;

        for (let page of this.attempt.pages) {
            numCurrentPage++;
            if (this.page && page.uuid === this.page.uuid) {
                break;
            }
        }

        return (numCurrentPage === this.attempt.pages.length);

    }
    ///////////////////////////////////////////////////////////

    public static pageRealScore(page: PageQuizAttemptInterface): number {
        let realScore: number = 0;
        page.questions.forEach((q) => realScore += q.score * q.weight);
        return realScore;
    }

    public static pageMaxScore(page: PageQuizAttemptInterface): number {
        let maxScore: number = 0;
        page.questions.forEach((q) => maxScore += 100 * q.weight);
        return maxScore;
    }



    ///////////////////////////////////////////////////////////

    // Очищает попытку тестирования
    //
    private clear() {
        this.slide = null;
        this.attempt = null;
        this.page = null;
        this.alert(); // Очищаем alert
    }

    // Показывает alert (панель внизу) с ходом тестирования
    //
    private timerId: any;
    private alertData: AlertInterface;

    private alert(): void {

        if (this.attempt && this.slide) {

            // Формируем alert

            if (!this.alertData) {
                this.alertData = {
                    timer: null,
                    progress: null
                };
            }

            // Считаем прогресс

            let numCurrentPage = 0;

            for (let page of this.attempt.pages) {
                numCurrentPage++;
                if (this.page && page.uuid === this.page.uuid) {
                    break;
                }
            }

            this.alertData.progress = {
                current: numCurrentPage,
                total: this.attempt.pages.length
            };

            // Запускаем таймер

            if (this.slide.quiz.level.timePeriod && this.attempt.start && !this.timerId) {

                this.alertData.timer = {
                    value: 0,
                    status: alertStatus.NORMAL
                };

                let setTimer = () => {

                    this.alertData.timer.value = Math.round(this.attempt.start.getTime() / 1000 + this.slide.quiz.level.timePeriod - new Date().getTime() / 1000);
                    this.alertData.timer.value = (this.alertData.timer.value < 0) ? 0 : this.alertData.timer.value;

                    if (this.alertData.timer.value) {

                        this.alertData.timer.status = alertStatus.NORMAL;

                        let completeQuestions: number = 0;
                        let allQuestions: number = 0;

                        for (let page of this.attempt.pages) {
                            for (let question of page.questions) {
                                if (question.complete) {
                                    completeQuestions++;
                                }
                                allQuestions++;
                            }
                        }

                        if (allQuestions) {

                            let timeToQuestion = this.slide.quiz.level.timePeriod / allQuestions; // Время на один вопрос
                            let spentTime = Math.round(new Date().getTime() / 1000 - this.attempt.start.getTime() / 1000); // Уже прошло времени

                            // Сравниваем потраченное время и время, которое можно потратить,
                            // плюс еще время на текущий вопрос с коэффициэнтом.

                            if (spentTime > (timeToQuestion * completeQuestions + timeToQuestion * 0.7)) {
                                this.alertData.timer.status = alertStatus.DANGER;
                            } else if (spentTime > (timeToQuestion * completeQuestions + timeToQuestion * 0.5)) {
                                this.alertData.timer.status = alertStatus.ATTENTION;
                            }

                        }

                    } else {

                        this.alertData.timer.status = alertStatus.DANGER;
                        this.onTimeOver.next(this.attempt);

                    }


                };

                setTimer(); // Первый раз не ждем секунду

                this.timerId = setInterval(setTimer, 1000);

            }



        } else {

            // Очищаем alert

            if (this.timerId) {
                clearInterval(this.timerId);
            }

            this.timerId = null;
            this.alertData = null;

        }

        // Передаем данные alert в его провайдер (даже null)

        this.ap.onChange.next(this.alertData);

    }




}