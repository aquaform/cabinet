
import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { CourseDataInterface } from "./interface/data-interface/course-data.interface";
import { LearningProvider } from "./learning/learning.provider";
import { LearningInterface } from "./interface/learning-interface/learning.interface";
import { ErrorsService } from '@modules/root/errors/errors.service';
import { APIProvider } from './learning/api/api.provider';
import { AlertProvider } from './alert/alert.provider';
import { ErrorProvider } from './error/error.provider';
import { QuestionAnswerProvider } from './learning/interactive/question-answer/question-answer.provider';
import { QuizAttemptProvider } from './learning/interactive/quiz-attempt/quiz-attempt.provider';
import { SCOAttemptProvider } from './learning/interactive/sco-attempt/sco-attempt.provider';
import { ModalProvider } from './modal/modal.provider';
import { SlideProvider } from './slides/slide/slide.provider';
import { SearchProvider } from './search/search.provider';
import { environment } from "@environments/environment";
import { CourseDataProvider } from "./data/course-data.provider";
import { CourseAPISettings } from "@modules/resources/res/res.interface";
import { AppComponentTemplate } from "@shared/component.template";
import { takeUntil } from "rxjs/operators";

declare let courseData: CourseDataInterface; // global var
declare let courseAPISettings: CourseAPISettings; // global var

@Component({
    selector: "app-courses",
    templateUrl: "courses.component.html",
    styleUrls: ["courses.component.scss"]
})

export class CoursesComponent extends AppComponentTemplate {

    courseData: CourseDataInterface;
    learningData: LearningInterface;
    errorCode: string;
    isClosing = false;
    ready = false;

    constructor(
        private titleService: Title,
        private lp: LearningProvider,
        private err: ErrorsService,
        private api: APIProvider,
        private alert: AlertProvider,
        private ep: ErrorProvider,
        private qAnswer: QuestionAnswerProvider,
        private qAttempt: QuizAttemptProvider,
        private sco: SCOAttemptProvider,
        private modal: ModalProvider,
        private slide: SlideProvider,
        private search: SearchProvider
        ) {

        super();

        if (environment.displayLog) {
            console.log("Course data:", window['courseData'])
        }

        if ('courseData' in window && !!window['courseData']) {
            this.courseData = courseData;
            this.titleService.setTitle(courseData.title);
        } else {
            this.errorCode = "course-data-empty";
        }

        // Важен порядок исходя из зависимостей.
        // Примечание: инициализация провайдеров
        // необходима, так как они инициализируются
        // глобально и требуют повторной инициализации для
        // каждого нового курса.
        //
        this.alert.init(this.ngUnsubscribe);
        this.modal.init(this.ngUnsubscribe);
        this.ep.init(this.ngUnsubscribe);
        this.qAnswer.init(this.ngUnsubscribe);
        this.qAttempt.init(this.ngUnsubscribe);
        this.sco.init(this.ngUnsubscribe);
        this.slide.init(this.ngUnsubscribe);
        this.search.init(this.ngUnsubscribe);
        this.api.init(this.ngUnsubscribe);
        this.lp.init(this.ngUnsubscribe);

        this.checkReady();

        this.lp.onGetLearningData.pipe(takeUntil(this.ngUnsubscribe)).subscribe(learningData => {
            this.learningData = learningData;
            this.checkReady();
        });

        this.lp.onLearningError.pipe(takeUntil(this.ngUnsubscribe)).subscribe(error => {
            this.errorCode = error;
            this.err.register(error);
            this.checkReady();
        });

        this.lp.onClose.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
            this.isClosing = true;
            this.checkReady();
        });

    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.clearData();
     }

    checkReady() {
        this.ready = !!this.courseData && !!this.learningData && !this.errorCode && !this.isClosing;
    }

    clearData() {
        // Важно выполнять чистку при уничтожении компонента, чтобы
        // избежать обращения к очищаемым переменным в процессе выхода.
        for (const nameForDelete of courseAPISettings.storageNamesForClear) {
            localStorage.removeItem(nameForDelete);
        }
        CourseDataProvider.clearData();
    }



}

