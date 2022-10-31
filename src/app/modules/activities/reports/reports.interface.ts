import { EduElectronicResource } from '../activities.interface';
import { ObjectAPI, DateAPI, ArrayElementAPI, TrimAPI } from '@modules/root/api/api.converter';
import { UserDescription } from '@modules/user/user.interface';

/* Результаты тестирования */

export class ReportQuizQuestion {
    name: string;
    id: string;
    task: string;
}

export class ReportQuizQuestionVariant {
    answerVariant: string;
    text: string;
    number: number;
    selected: boolean;
    wrongNotSelected: boolean;
    wrongSelected: boolean;
    rightNotSelected: boolean;
    rightSelected: boolean;
    right: boolean;
    // ДОБАВЛЕНО
    // Примечание: свойства correct и wrong нужны, чтобы
    // выделить верные и ошибочные варианты ответа. На параметр
    // right ориентироваться нельзя, так как он будет false для
    // вопросов без верных вариантов, например Последовательность.
    get correct(): boolean {
        return this.rightSelected || this.rightNotSelected;
    }
    get wrong(): boolean {
        return this.wrongSelected || this.wrongNotSelected;
    }
}

@ArrayElementAPI(ReportQuizQuestionVariant)
export class ReportQuizQuestionVariantArray extends Array<ReportQuizQuestionVariant> {
}

export class ReportAnswerQuestion {
    @ObjectAPI(ReportQuizQuestion) question: ReportQuizQuestion;
    weight: number;
    @DateAPI() date: Date;
    psychological: boolean;
    result: number;
    mustVerifiedTeacher: boolean;
    verifiedTeacher: boolean;
    teacher: {
        id: string;
    };
    @TrimAPI() fullUserAnswer: string;
    @TrimAPI() teacherComment: string;
    helpUsed: boolean;
    displayNumber: number;
    @ObjectAPI(ReportQuizQuestionVariantArray) variants: ReportQuizQuestionVariantArray;
    // ДОБАВЛЕНО:
    // Признак, что список заданий развернут пользователем
    private userDetailsStatus: boolean;
    // Устанавливает пользовательское значение userDetailsStatus
    changeUserDetailsStatus(status?: boolean) {
        if (typeof status === "boolean") {
            this.userDetailsStatus = status;
            return;
        }
        this.userDetailsStatus = !this.detailsStatus;
    }
    // Возвращает текущее значение userDetailsStatus
    get detailsStatus(): boolean {
        if (typeof this.userDetailsStatus === "boolean") {
            return this.userDetailsStatus;
        }
        if (!!this.teacherComment) {
            return true; // Есть комментарий от преподавателя
        }
        return false;
    }

    displayResult(showScoreQuizResults: boolean): boolean {
        return (!this.psychological && showScoreQuizResults) ? true : false;
    }
    displayWeight(showScoreQuizResults: boolean): boolean {
        return (this.weight !== 1 && this.displayResult(showScoreQuizResults)) ? true : false;
    }
    get displayDetails(): boolean {
        if (this.psychological) {
            return false;
        }
        if (this.variants && this.variants.length && this.variants.findIndex(val => val.wrong) > -1) {
            return true;
        }
        if (this.fullUserAnswer) {
            return true;
        }
        if (this.teacherComment) {
            return true;
        }
        return false;
    }
    get isAnswer(): boolean {
        return typeof this.result === 'number';
    }
}

@ArrayElementAPI(ReportAnswerQuestion)
export class ReportAnswerQuestionArray extends Array<ReportAnswerQuestion> {

}

export class ReportQuizAttempt {
    @DateAPI() date: Date;
    result: number;
    mustCheckEducation: boolean;
    mustVerifiedTeacher: boolean;
    verifiedTeacher: boolean;
    @DateAPI() startDateUserActivity: Date;
    @DateAPI() endDateUserActivity: Date;
    @ObjectAPI(ReportAnswerQuestionArray) answersQuestions: ReportAnswerQuestionArray;
    @ObjectAPI(EduElectronicResource) electronicResource: EduElectronicResource;
    @ObjectAPI(EduElectronicResource) itemElectronicResource: EduElectronicResource;
    mark: string;
    psychological: boolean;
    // ДОБАВЛЕНО:
    get title(): string {

        if (this.electronicResource
            && this.itemElectronicResource
            && this.electronicResource.name
            && this.itemElectronicResource.name
            && this.electronicResource.name !== this.itemElectronicResource.name) {

            return `${this.electronicResource.name} • ${this.itemElectronicResource.name}`;

        }

        if (this.electronicResource && this.electronicResource.name) {
            return this.electronicResource.name;
        }

        if (this.itemElectronicResource && this.itemElectronicResource.name) {
            return this.itemElectronicResource.name;
        }

        return "";

    }
    displayResult(): boolean {
        return (this.psychological) ? false : true;
    }

}

@ArrayElementAPI(ReportQuizAttempt)
export class ReportQuizAttemptArray extends Array<ReportQuizAttempt> {

}

export class ReportQuizResultsResponse extends ReportQuizAttemptArray {

}

/* Результаты опроса качества обучения */

export class ReportActivityPollResult {
    comment: string;
    @DateAPI() date: Date;
    mark: number;
    @ObjectAPI(UserDescription) user: UserDescription;
}

@ArrayElementAPI(ReportActivityPollResult)
export class ReportActivityPollResultsResponse extends Array<ReportActivityPollResult> {

}