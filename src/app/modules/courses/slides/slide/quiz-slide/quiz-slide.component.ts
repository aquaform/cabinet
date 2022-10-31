import { Component, Input, OnChanges, OnDestroy, OnInit } from "@angular/core";
import { CourseDataInterface, QuizSlideDataInterface } from "../../../interface/data-interface/course-data.interface";
import { QuizAttemptInterface, PageQuizAttemptInterface } from "../../../interface/learning-interface/quiz/quiz-attempt.interface";
import { QuizAttemptProvider } from "../../../learning/interactive/quiz-attempt/quiz-attempt.provider";
import { Router } from "@angular/router";
import { LearningProvider } from "../../../learning/learning.provider";
import { QuestionDataInterface, questionsTypes } from "../../../interface/data-interface/slides/question-data.interface";
import { QuizDataProvider } from "../../../data/quiz/quiz-data.provider";
import { animate, style, transition, trigger } from "@angular/animations";
import { QuestionAnswerInterface } from "../../../interface/learning-interface/quiz/question-answer.interface";
import { QuestionAnswerProvider } from "../../../learning/interactive/question-answer/question-answer.provider";
import { Subscription } from "rxjs";
import { ActivityInterface } from "../../../interface/learning-interface/learning.interface";
import { ModalProvider } from "../../../modal/modal.provider";
import { takeUntil } from "rxjs/operators";
import { AppComponentTemplate } from "@shared/component.template";

declare let courseData: CourseDataInterface; // global var

@Component({
    selector: "quiz-slide",
    templateUrl: "./quiz-slide.component.html",
    styleUrls: ["./quiz-slide.component.scss"],
    animations: [
        trigger('transition', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate(400)
            ])
        ])
    ]
})

export class QuizSlideComponent extends AppComponentTemplate implements OnInit, OnDestroy, OnChanges {

    @Input() slide: QuizSlideDataInterface; // Слайд с тестом
    @Input() uuidPage: string; // Идентификатор страницы тестирования, которую надо открыть
    @Input() uuidAttempt: string; // Идентификатор попытки тестирования

    public activity: ActivityInterface; // Общая активность
    public attempt: QuizAttemptInterface; // Попытка тестирования
    public page: PageQuizAttemptInterface; // Страница попытки тестирования
    public incompleteQuizAttempt: QuizAttemptInterface; // Незавершенная попытка тестирования

    questionsTypes = questionsTypes;

    courseData: CourseDataInterface;

    public hideAll: boolean = false;
    public isLastPage: boolean = false;

    public countQuestions: number;
    public countAllowAttempts: number;
    public countCompleteAttempts: number;
    public timeAllowed: number;
    public allowStart: boolean;
    public onlySingleQuestions: boolean;
    public displayQuestionResults: boolean;
    public allowCorrectMistakes: boolean;
    public displayFinalStatistic: boolean;
    public displayKeys: boolean;

    public activePageInStatistic: PageQuizAttemptInterface;

    subscribes: Subscription[] = [];

    constructor(private qa: QuizAttemptProvider,
        private lp: LearningProvider,
        private router: Router,
        private qp: QuestionAnswerProvider,
        private mp: ModalProvider) {

        super();
        this.courseData = courseData;

    }

    ngOnInit() {

        // Подписываемся на ответы на вопросы.
        // После каждого ответа переходим к странице
        // с неотвеченными вопросами.

        this.subscribes.push(
            this.qp.onComplete.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
                if (!this.displayQuestionResults) {
                    this.goToIncompletePage();
                }
            })
        );

        this.subscribes.push(
            this.qa.onTimeOver.pipe(takeUntil(this.ngUnsubscribe)).subscribe((attempt) => {

                if (this.attempt && attempt.uuid === this.attempt.uuid) {
                    this.qa.complete(this.attempt);
                    this.goToPage();
                }

            })
        );

        this.subscribes.push(
            this.qa.onResume.pipe(takeUntil(this.ngUnsubscribe)).subscribe((attempt) => {
                this.attempt = attempt;
                this.goToIncompletePage();
            })
        );

        this.subscribes.push(
            this.mp.isOpen.pipe(takeUntil(this.ngUnsubscribe)).subscribe((isModalOpen) => {
                this.hideAll = isModalOpen;
            })
        );

    }

    ngOnChanges() {

        // ngOnChanges так как параметры компонента меняются в тесте,
        // без удаления самого компонента.

        // Ищем учебную активность данного слайда

        this.activity = this.lp.learning.activities.find(
            (activity) => activity.slide === this.slide.uuid
        );

        // Определяем количество вопросов в тесте

        if (this.slide.quiz.level.countQuestions) {
            this.countQuestions = this.slide.quiz.level.countQuestions;
        } else {
            this.countQuestions = this.slide.quiz.questions.length;
        }

        // Определяем разрешено ли исправлять ошибки

        this.allowCorrectMistakes = ('allowCorrectMistakes' in this.slide.quiz) ? this.slide.quiz.allowCorrectMistakes : false;

        // Определяем надо ли показывать результат ответа на вопрос

        this.displayQuestionResults = ('displayQuestionResults' in this.slide.quiz) ? this.slide.quiz.displayQuestionResults : false;
        this.displayQuestionResults = (this.allowCorrectMistakes) ? true : this.displayQuestionResults;  // Если разрешено исправлять
        // ошибки, то и разрешено показывать результат ответа, так как без этого не исправить ошибку.

        // Определяем количество завершенных вопросов

        this.countAllowAttempts = this.slide.quiz.countAttempts;

        if (this.activity) {
            this.countCompleteAttempts = this.activity.quizAttempts.filter((attempt) => attempt.complete).length;
        } else {
            this.countCompleteAttempts = 0;
        }

        // Определяем сколько времени отведено на весь тест

        this.timeAllowed = this.slide.quiz.level.timePeriod;

        // Определяем можно ли начинать тест

        this.allowStart = (!this.countAllowAttempts || this.countCompleteAttempts < this.countAllowAttempts);

        // Определяем можно ли использовать быструю форму ответа (блиц-тесты)

        this.onlySingleQuestions = !(this.slide.quiz.questions.findIndex(
            (q) => q.type !== this.questionsTypes.SINGLE) > -1
        ); // Если нашли вопросы, не являющиеся простыми, то значит нельзя использовать простую форму.

        this.onlySingleQuestions = (this.allowCorrectMistakes) ? false : this.onlySingleQuestions; // Если разрешено исправлять
        // ошибки, то простую форму нельзя использовать.

        // Определяем показывать ли статистику на финальной странице

        this.displayFinalStatistic = ('displayFinalStatistic' in this.slide.quiz) ? this.slide.quiz.displayFinalStatistic : false;

        // Определяем показывать ли ключи на финальной странице

        this.displayKeys = ('displayKeys' in this.slide.quiz) ? this.slide.quiz.displayKeys : false;

        // Ищем попытку тестирования

        if (this.activity && this.uuidAttempt) {

            // Ищем переданную в слайд попытку тестирования

            this.attempt = this.activity.quizAttempts.find(
                (quizAttempt) => quizAttempt.uuid === this.uuidAttempt
            );

            if (!this.attempt) {
                console.error("No quiz attempt %s", this.uuidAttempt);
                this.goToPage();
                return;
            }

        }

        // Ищем незавершенную попытку тестирования

        if (this.activity && !this.uuidAttempt) {
            this.incompleteQuizAttempt = this.activity.quizAttempts.find(
                (quizAttempt) => !quizAttempt.complete
            );
        }

        // Определяем страницу теста по входящему параметру

        if (this.attempt && this.uuidPage) {
            this.page = this.attempt.pages.find((activityPage) => activityPage.uuid === this.uuidPage);
        } else {
            this.page = null;
        }

        // Вызываем события провайдера теста

        setTimeout(() => {
            if (this.attempt) {
                this.qa.change(this.page);
            } else {
                this.qa.leave();
            }
            this.isLastPage = this.qa.isLastPage(); // Определяем последняя ли это страница теста
        }, 1);

    }

    ngOnDestroy() {

        // Удаляем подписки

        for (const subscription of this.subscribes) {
            subscription.unsubscribe();
        }

    }

    start() {

        this.attempt = this.qa.start(this.slide);
        this.goToIncompletePage();

    }

    resume() {
        this.qa.resume(this.incompleteQuizAttempt, this.slide);
    }

    // Переходит на страницу теста
    //
    goToPage(page?: PageQuizAttemptInterface): void {

        if (page && this.attempt) {
            // Открываем страницу попытки
            this.router.navigate(['/course', 'slide', this.slide.uuid, 'attempt', this.attempt.uuid, 'page', page.uuid]);
        } else if (this.attempt) {
            // Открываем финальную страницу попытки
            this.router.navigate(['/course', 'slide', this.slide.uuid, 'attempt', this.attempt.uuid]);
        } else {
            // Открываем стартовую страницу теста
            this.router.navigate(['/course', 'slide', this.slide.uuid]);
        }

    }

    // Переходит к странице с неотвеченным вопросом
    //
    goToIncompletePage() {

        let nextPage = this.qa.nextPage();

        if (!nextPage) {
            this.qa.complete(this.attempt);
        }

        this.goToPage(nextPage);

    }

    // Данные шаблона вопроса для передачи в компонент вопроса
    //
    dataQuestion(quizQuestion: QuestionAnswerInterface): QuestionDataInterface {
        return QuizDataProvider.findQuestion(this.slide.quiz, quizQuestion.question);
    }

    pageRealScore(page: PageQuizAttemptInterface): number {
        return QuizAttemptProvider.pageRealScore(page);
    }

    pageMaxScore(page: PageQuizAttemptInterface): number {
        return QuizAttemptProvider.pageMaxScore(page);
    }

    finalPageSelectPage(page: PageQuizAttemptInterface) {
        this.activePageInStatistic = (page === this.activePageInStatistic) ? null : page;
    }

    get displayResult(): boolean {
        return this.slide.quiz.questions.findIndex(v => v.type === questionsTypes.TEXT) === -1;
    }

}

