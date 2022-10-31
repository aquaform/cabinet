import { ObjectAPI, ConvertValueAPI, DateAPI, ArrayElementAPI } from '@modules/root/api/api.converter';
import {
    EduTemplate,
    EduScaleMarks,
    EduResources,
    numberToEduActivityStatus,
    numberToEduStatus,
    EduStatus,
    EduActivityStatus,
    EduMark,
    EduActivityType,
    EduReasonsToRevisionArray,
    EduUserDescription,
    eduStatuses,
    eduUserToUserDescription,
    eduActivityStatuses,
    numberToDurationVariant,
    DurationVariant,
    durationVariants,
    durationLeft,
    EduActivity,
    eduActivityTypes,
    activityWasStarting,
    activityWasEnding,
    displayDurationFromStart,
    ActivityPluginService,
    numberToStatusReason,
    StatusReason,
    statusReasonToDisplay
} from '../activities.interface';
import { DatesTools } from '@modules/root/dates/dates.class';
import { UserDescription, TeacherUserDescription } from '@modules/user/user.interface';
import { AnyAPIObject, APIServiceNames } from '@modules/root/api/api.interface';
import { SettingsService } from '@modules/root/settings/settings.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '@modules/root/i18n/i18n.class';
import { NumbersTools } from '@modules/root/numbers/numbers.class';

export class EduStudentTaskDescription extends AnyAPIObject {
    electronicResource: string;
    onElectronicResource: boolean;
    task: string;
    complete: boolean;
    @ObjectAPI(EduMark) mark: EduMark;
    importance: number;
    name: string;
    attempt: string;
    percentProgress: number;
    mustVerifiedTeacher: boolean;
    verifiedTeacher: boolean;
    teacherComment: string;
    toRevision: boolean;
    passingScore: number;
    @ObjectAPI(EduMark) passingMark: EduMark;
    score: number;
    performed: boolean;
    isScore: boolean;
    spentTimeBySeconds: number;
    notWaitCheck: boolean;
    @DateAPI() dateToCheckTask: Date; // Свойство добавлено в версии 3.0.12.68
    @DateAPI() dateToRevisionTask: Date; // Свойство добавлено в версии 3.0.12.68
    @DateAPI() startDateAccessToTask: Date; // Свойство добавлено в версии 3.0.12.84
    @DateAPI() endDateAccessToTask: Date; // Свойство добавлено в версии 3.0.12.84
    hideTimeAccessToTask: boolean; // Свойство добавлено в версии 3.0.12.84
    mustCheckEducation: boolean; // Свойство добавлено в версии 3.0.18.27 (использовать только через обертку)
    // ДОБАВЛЕНО:
    get mustScore(): boolean {
        if ("mustCheckEducation" in this && typeof this.mustCheckEducation === 'boolean') {
            return this.mustCheckEducation;
        }
        // Для совместимости с данными до версии 3.0.18.27:
        if (this.complete && !this.isScore && !this.mustVerifiedTeacher) {
            return false;
        }
        return true;
    }
    get dateToCheckTaskIsEmpty(): boolean {
        return DatesTools.IsEmptyDate(this.dateToCheckTask);
    }
    get activityDescription(): EduStudentActivityDescription {
        if (this._parent && this._parent._parent && this._parent._parent._parent) {
            return this._parent._parent._parent as EduStudentActivityDescription;
        }
        return null;
    }
    get sequentialTasks(): boolean {
        const activityDescription = this.activityDescription;
        if (activityDescription && typeof activityDescription.sequentialTasks === "boolean") {
            return activityDescription.sequentialTasks;
        }
        return false;
    }
    get previousTask(): EduStudentTaskDescription {
        const activityDescription = this.activityDescription;
        if (!activityDescription) {
            return null;
        }
        let previousTask: EduStudentTaskDescription = null;
        for (const currentTask of activityDescription.tasksArray) {
            if (currentTask === this) {
                break;
            }
            previousTask = currentTask;
        }
        return previousTask;
    }
    get isAccessDates(): boolean {
        return !DatesTools.IsEmptyDate(this.startDateAccessToTask)
            || !DatesTools.IsEmptyDate(this.endDateAccessToTask);
    }
    get expired(): boolean {
        if (!this.complete
            && this.performed
            && !DatesTools.IsEmptyDate(this.endDateAccessToTask)
            && this.endDateAccessToTask.getTime() < (new Date()).getTime()) {
            return true;
        }
        return false;
    }
    get available(): boolean {
        const previousTask = this.previousTask;
        if (!DatesTools.IsEmptyDate(this.startDateAccessToTask)
            && this.startDateAccessToTask.getTime() > (new Date()).getTime()) {
            return false; // Дата начала выполнения задания еще не наступила
        }
        if (this.sequentialTasks && previousTask) {
            if (!previousTask.available) {
                return false; // Предыдущее задание не доступно, так как например не выполнено предшествующее ему
            }
            // Установлен флажок "Открытые вопросы и задания проверяются выборочно" или "Не ждать проверки"
            if (this.activityDescription.tasksCheckedSelectively || (previousTask && previousTask.notWaitCheck)) {
                if (!previousTask.complete) {
                    return false; // Задание не завершено
                }
                if (previousTask.onElectronicResource && previousTask.passingScore && previousTask.score < previousTask.passingScore) {
                    return false; // Это задание на основе электронного ресурса и не набраны проходные баллы
                }
            } else { // Стандартная логика
                if (!previousTask.performed) {
                    return false; // Предыдущее задание не выполнено
                }
            }
        }
        return true;
    }
    get highlightMark(): boolean {
        if (this.complete && this.passingMark && this.score < this.passingScore) {
            if (!this.mustVerifiedTeacher || this.verifiedTeacher) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    get checked(): boolean {
        return !this.toRevision && this.mustVerifiedTeacher && this.verifiedTeacher;
    }
    get mustCheck(): boolean {
        return !this.toRevision && this.complete && this.mustVerifiedTeacher && !this.verifiedTeacher;
    }
    get onlyControl(): boolean {
        return this.mustCheck && !this.mustScore;
    }
    get displayMark(): boolean {
        const activityDescription = this.activityDescription;
        if (activityDescription && !activityDescription.displayFullTaskInfo && this.importance === 0) {
            return false; // Не показываем оценку, если она не учитывается при значимости 0 и подробные
            // сведения о задании не показываются.
        }
        if (this.disabledByTeacher) {
            return false;
        }
        if (this.onlyControl) {
            return false;
        }
        return this.isScore;
    }
    get displayWithoutMark(): boolean {
        const activityDescription = this.activityDescription;
        if (activityDescription
            && activityDescription.mustCheckEducation
            && !this.isScore
            && this.complete
            && !this.mustScore
            && !this.mustCheck
            && !this.disabledByTeacher) {
            return true;
        }
        return false;
    }
    get disabledByTeacher(): boolean {
        return (this.attempt) ? false : true;
    }
    get isElectronicResource(): boolean {
        return this.onElectronicResource;
    }
    title(openedTaskStudentActivity: EduStudentActivityDescription): string {
        let title = openedTaskStudentActivity.name + ' • ' + this.name;
        if (!DatesTools.IsEmptyDate(this.dateToCheckTask)) {
            title += ' • ' + dayjs(this.dateToCheckTask).format('LL HH:mm');
        }
        return title;
    }
    get scaleMarks(): EduScaleMarks {
        const activityDescription = this.activityDescription;
        if (!activityDescription) {
            return undefined;
        }
        return activityDescription.scaleMarks;
    }
}

@ArrayElementAPI(EduStudentTaskDescription)
export class EduStudentTaskDescriptions extends Array<EduStudentTaskDescription> {
}

export class EduStudentTaskDescriptionsObject {
    @ObjectAPI(EduStudentTaskDescriptions) task: EduStudentTaskDescriptions;
}

export class EduStudentSingleTaskDescription {
    onElectronicResource: boolean;
    onElectronicCourse: boolean;
    task: string;
    complete: boolean;
    name: string;
    electronicResource: string;
    electronicCourse: string;
    percentProgress: number;
    fragment: string;
    // ДОБАВЛЕНО:
    get isResLink(): boolean {
        return this.onElectronicCourse || this.onElectronicResource;
    }
}

export type SpentTimeDisplayOptions = "NONE" | "HOUR" | "EDU_HOUR";

export const spentTimeDisplayOptions = {
    NONE: "NONE" as SpentTimeDisplayOptions,
    HOUR: "HOUR" as SpentTimeDisplayOptions,
    EDU_HOUR: "EDU_HOUR" as SpentTimeDisplayOptions,
};

export const convertSpentTimeDisplayOptions = (timeDisplayOption: number): SpentTimeDisplayOptions => {
    switch (timeDisplayOption) {
        case 1:
            return spentTimeDisplayOptions.NONE;
        case 2:
            return spentTimeDisplayOptions.HOUR;
        case 3:
            return spentTimeDisplayOptions.EDU_HOUR;
        default:
            return spentTimeDisplayOptions.NONE;
    }
};




export class EduStudentActivityUserFile {
    id: string;
    name: string;
    extension: string;
    size?: number;
}

@ArrayElementAPI(EduStudentActivityUserFile)
export class EduStudentActivityUserFileArray extends Array<EduStudentActivityUserFile>  {
}

export class EduStudentActivityUserFileArrayObject {
    @ObjectAPI(EduStudentActivityUserFileArray) file: EduStudentActivityUserFileArray;
}



export class EduStudentActivityDescription extends AnyAPIObject {
    name: string;
    @ConvertValueAPI(numberToEduStatus) statusEducation: EduStatus;
    @ConvertValueAPI(numberToEduActivityStatus) statusActivity: EduActivityStatus;
    actual: boolean;
    @DateAPI() startDateUserActivityNumber: Date;
    @DateAPI() endDateUserActivityNumber: Date;
    periodAsString: string;
    hideEduDate: boolean;  // Deprecated
    @DateAPI() dateControlNumber: Date; // Deprecated
    dateControlAsString: string; // Deprecated
    commentToUserFromManager: string;
    commentToUserFromTeacher: string;
    commentToUserContext: string;
    allowUserComplete: boolean;
    userActivity: string;
    availableFileUpload: boolean;
    availableQualityPoll: boolean;
    availableQualityPollResults: boolean;
    markQualityPoll: number;
    commentQualityPoll: string;
    descriptionQualityPoll: string;
    titleQualityPoll: string;
    providingEducation: string;
    availableParticipantsList: boolean;
    availableTeachersList: boolean;
    availableForumCategory: boolean;
    webAddress: string;
    @ObjectAPI(EduResources) resources: EduResources;
    electronicEducation: boolean;
    @ConvertValueAPI(eduUserToUserDescription) user: UserDescription;
    mustVerifiedTeacher: boolean;
    verifiedTeacher: boolean;
    mustCheckEducation: boolean;
    @ObjectAPI(EduScaleMarks) scaleMarks: EduScaleMarks;
    @ObjectAPI(EduTemplate) eduTemplate: EduTemplate;
    score: number;
    @ObjectAPI(EduMark) mark: EduMark;
    currentScore: number; // Добавлено в 3.0.13.2
    @ObjectAPI(EduMark) currentMark: EduMark; // Добавлено в 3.0.13.2
    showQuizResults: boolean;
    availableChildActivities: boolean;
    sequentialTasks?: boolean;
    availableAdditionalInformation: boolean;
    displayScore: boolean;
    displayFullTaskInfo: boolean;
    percentProgress: number;
    certificate: string;
    classroom: string;
    territory: string;
    @ObjectAPI(EduStudentTaskDescriptionsObject) tasks: EduStudentTaskDescriptionsObject; // Заполняется сервером с учетом статуса
    @ObjectAPI(EduStudentTaskDescriptionsObject) tasksDescription: EduStudentTaskDescriptionsObject; // Заполняется сервером всегда
    @ObjectAPI(EduStudentSingleTaskDescription) singleTask: EduStudentSingleTaskDescription; // Заполняется сервером с учетом статуса
    @ObjectAPI(EduStudentSingleTaskDescription) singleTaskDescription: EduStudentSingleTaskDescription; // Заполняется сервером всегда
    tasksAreAvailable: boolean;
    @ObjectAPI(EduStudentActivityUserFileArrayObject) userFiles: EduStudentActivityUserFileArrayObject;
    showAnswersQuizResults: boolean;
    showScoreQuizResults: boolean;
    image: string;
    @ConvertValueAPI(convertSpentTimeDisplayOptions) timeDisplayOption: SpentTimeDisplayOptions;
    @DateAPI() startDuration: Date;
    durationBySeconds: number;
    @ConvertValueAPI(numberToDurationVariant) durationVariant: DurationVariant;
    tasksCheckedSelectively: boolean;
    timeRemainingString: string;
    durationByString: string;
    toRevision: boolean;
    @ObjectAPI(ActivityPluginService) pluginService: ActivityPluginService; // Добавлено в 3.0.15
    @ConvertValueAPI(numberToStatusReason) statusReason: StatusReason; // Добавлено в 3.0.17
    // ДОБАВЛЕНО:
    isModifiedInCheckList: boolean; // Признак того, что запись была изменена преподавателем в ведомости
    private userDetailsStatus: boolean; // Признак, что список заданий развернут пользователем
    get userFilesArray(): EduStudentActivityUserFile[] {
        if (!this.userFiles) {
            return [];
        }
        return this.userFiles.file.filter((val) => val);
    }
    addUserFile(id: string, name: string, extension: string) {
        if (!this.userFiles) {
            this.userFiles = {
                file: []
            };
        }
        const newFile: EduStudentActivityUserFile = {
            id: id,
            name: name,
            extension: extension,

        };
        this.userFiles.file.push(newFile);
    }
    deleteUserFile(id: string) {
        if (!this.userFilesArray.length) {
            return;
        }
        this.userFiles.file = this.userFiles.file.filter((val) => val.id !== id);
    }
    get isCompleteInCheckList(): boolean {
        return (this.statusEducation === eduStatuses.COMPLETED
            || this.statusEducation === eduStatuses.COMPLETED_NOT_VERIFIED)
            && this.statusActivity === eduActivityStatuses.FINISHED;
    }
    set isCompleteInCheckList(isComplete: boolean) {
        this.isModifiedInCheckList = true;
        if (isComplete) {
            if (this.mustVerifiedTeacher && !this.verifiedTeacher) {
                this.statusEducation = eduStatuses.COMPLETED_NOT_VERIFIED;
            } else {
                this.statusEducation = eduStatuses.COMPLETED;
            }
            this.statusActivity = eduActivityStatuses.FINISHED;
        } else {
            if (this.mustVerifiedTeacher && !this.verifiedTeacher && !this.tasksCheckedSelectively) {
                this.statusEducation = eduStatuses.VERIFIED;
            } else {
                if (this.toRevision) {
                    this.statusEducation = eduStatuses.TO_REVISION;
                } else {
                    this.statusEducation = eduStatuses.ACTIVE;
                }
            }
            this.statusActivity = eduActivityStatuses.IN_PROGRESS;
        }
    }
    get isIncompleteInCheckList(): boolean {
        return this.statusEducation === eduStatuses.INCOMPLETE && this.statusActivity === eduActivityStatuses.NOT_FINISHED;
    }
    set isIncompleteInCheckList(isIncomplete: boolean) {
        this.isModifiedInCheckList = true;
        if (isIncomplete) {
            this.statusEducation = eduStatuses.INCOMPLETE;
            this.statusActivity = eduActivityStatuses.NOT_FINISHED;
        } else {
            this.statusEducation = eduStatuses.ACTIVE;
            this.statusActivity = eduActivityStatuses.IN_PROGRESS;
        }
        if (this.markInCheckList && isIncomplete) {
            this.markInCheckList = null;
        }
    }
    get isNotAdmittedInCheckList(): boolean {
        return this.statusEducation === eduStatuses.NOT_ADMITTED && this.statusActivity === eduActivityStatuses.NOT_ADMITTED;
    }
    set isNotAdmittedInCheckList(isNotAdmitted: boolean) {
        this.isModifiedInCheckList = true;
        if (isNotAdmitted) {
            this.statusEducation = eduStatuses.NOT_ADMITTED;
            this.statusActivity = eduActivityStatuses.NOT_ADMITTED;
        } else {
            this.statusEducation = eduStatuses.ACTIVE;
            this.statusActivity = eduActivityStatuses.IN_PROGRESS;
        }
        if (this.markInCheckList && isNotAdmitted) {
            this.markInCheckList = null;
        }
    }
    get isAutoInCheckList(): boolean {
        return this.statusEducation === eduStatuses.AUTO && this.statusActivity === eduActivityStatuses.AUTO;
    }
    set isAutoInCheckList(isAuto: boolean) {
        this.isModifiedInCheckList = true;
        if (isAuto) {
            this.statusEducation = eduStatuses.AUTO;
            this.statusActivity = eduActivityStatuses.AUTO;
        } else {
            this.statusEducation = eduStatuses.ACTIVE;
            this.statusActivity = eduActivityStatuses.IN_PROGRESS;
        }
        if (this.markInCheckList && isAuto) {
            this.markInCheckList = null;
        }
    }
    get teacherCommentInCheckList(): string {
        return this.commentToUserFromTeacher;
    }
    set teacherCommentInCheckList(comment: string) {
        this.isModifiedInCheckList = true;
        this.commentToUserFromTeacher = comment;
    }
    get markInCheckList(): string | number {
        if (!this.mark) {
            return undefined;
        }
        return this.scaleMarks.getValue(this.mark);
    }
    set markInCheckList(value: string | number) {
        this.isModifiedInCheckList = true;
        this.mark = this.scaleMarks.getByValue(value);
        if (this.mark && this.isIncompleteInCheckList) {
            this.isIncompleteInCheckList = false;
        }
        if (this.mark && !this.isCompleteInCheckList) {
            this.isCompleteInCheckList = true;
        }
    }
    get displayDurationFromStart(): boolean {
        return displayDurationFromStart(this.statusEducation, this.durationVariant, this.durationBySeconds);
    }
    get durationLeft(): number {
        return durationLeft(
            this.actual,
            this.durationVariant,
            this.statusEducation,
            this.durationBySeconds,
            this.startDuration,
            this.endDateUserActivityNumber);
    }
    private _durationLeft$ = new BehaviorSubject(null);
    private updateDurationLeft() {
        this._durationLeft$.next(this.durationLeft);
    }
    constructor() {
        super();
        setTimeout(() => this.updateDurationLeft(), 1);
        setInterval(() => this.updateDurationLeft(), 10 * 1000);
    }
    get durationLeft$(): Observable<number> {
        return this._durationLeft$.asObservable();
    }
    get statusColor$(): Observable<"warning" | "success" | "error" | ""> {
        return this.durationLeft$.pipe(map((duration) => {
            if (duration === -1) {
                return "";
            }
            if (this.statusEducation === eduStatuses.ACTIVE) {
                return "warning";
            }
            if (this.statusEducation === eduStatuses.NEW) {
                return "success";
            }
            if (this.statusEducation === eduStatuses.TO_REVISION) {
                return "error";
            }
            return "";
        }));
    }
    get displayPeriod(): boolean {
        return this.durationVariant === durationVariants.STATIC
            && (!DatesTools.IsEmptyDate(this.startDateUserActivityNumber)
                || !DatesTools.IsEmptyDate(this.endDateUserActivityNumber));
    }
    get displayFinishButton(): boolean {
        return this.allowUserComplete
            && this.actual
            && this.statusEducation !== eduStatuses.VERIFIED
            && this.statusEducation !== eduStatuses.NEW;
    }
    // Свойство singleTask заполняется базой, когда задание доступно
    // и не требуется отдельно проверять статус обучения на клиенте.
    // Проверка статуса выполняется только для отображения нужного
    // названия кнопки.
    get displayContinueCommand(): boolean {
        return this.isSingleElectronicResource
            && !this.displayStartCommand && !this.displayOpenCommand;
    }
    get displayStartCommand(): boolean {
        if (this.statusEducation === eduStatuses.NEW && this.electronicEducation) {
            if (this.singleTask) {
                return true;
            }
            if (this.durationVariant === durationVariants.FROM_EDU_START) {
                return true;
            }
            if (!DatesTools.IsEmptyDate(this.startDuration) && this.startDuration.getTime() < (new Date()).getTime()) {
                return true;
            }
        }
        return false;
    }
    get displayGoToCommand(): boolean {
        return !!this.pluginService?.webAddress;
    }
    get displayOpenCommand(): boolean {
        return this.isSingleElectronicResource
            && (this.statusEducation === eduStatuses.COMPLETED
                || this.statusEducation === eduStatuses.INCOMPLETE
                || this.statusEducation === eduStatuses.COMPLETED_NOT_VERIFIED);
    }
    get isSingleElectronicResource(): boolean {
        return this.singleTask
            && (this.singleTask.onElectronicResource || this.singleTask.onElectronicCourse);
    }
    get spentTimeBySeconds(): number {
        if (this.isSingleElectronicResource && this.tasksArray.length === 1) {
            return this.tasksArray[0].spentTimeBySeconds;
        }
        return 0;
    }
    get tasksArray(): EduStudentTaskDescription[] {
        return (this.tasks && this.tasks.task) ? this.tasks.task : [];
    }
    get tasksForTeacherArray(): EduStudentTaskDescription[] {
        return (this.tasksDescription && this.tasksDescription.task) ? this.tasksDescription.task : this.tasksArray;
    }
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
        if (!!this.tasksArray.find((val) => val.mustCheck)) {
            return true; // Есть задания на проверку
        }
        return false;
    }
    imagePath(settings: SettingsService): string {
        if (!this.image) {
            return "";
        }
        return settings.ImageURL(this.image).split("\\").join("/");
    }
    get availableUserFilesPage(): boolean {
        return this.availableFileUpload;
    }
    get availableTasksPage(): boolean {
        return this.tasks
            && !this.singleTask
            && this.tasks.task.length > 0
            && !this.isSingleElectronicResource
            && !this.displayStartCommand;
    }
    get availableSingleTaskPage(): boolean {
        return this.singleTask
            && !this.singleTask.isResLink
            && !this.displayStartCommand;
    }
    get availableResourcesPage(): boolean {
        const isResources: boolean = (this.resources) ? this.resources.isResources : false;
        const isEducationRecordings: boolean = (this.pluginService) ? !!this.pluginService.recordingsArray.length : false;
        return isResources || isEducationRecordings;
    }
    get wasStarting(): boolean {
        return activityWasStarting(this.electronicEducation, this.statusEducation);
    }
    get wasEnding(): boolean {
        return activityWasEnding(this.electronicEducation, this.statusEducation);
    }
    get displayWithoutMark(): boolean {
        if (this.mustCheckEducation
            && !this.mark
            && this.statusEducation === eduStatuses.COMPLETED
            && !this.currentMark) {
            return true;
        }
        return false;
    }
    get displayCurrentMark(): boolean {
        if (this.statusEducation === eduStatuses.AUTO) {
            return false;
        }
        if (this.statusEducation === eduStatuses.INCOMPLETE) {
            return false;
        }
        if (this.statusEducation === eduStatuses.NOT_ADMITTED) {
            return false;
        }
        return !!this.currentMark;
    }
    get statusReasonToDisplay(): StatusReason | undefined {
        if (!("statusReason" in this)) {
            return undefined;
        }
        return statusReasonToDisplay(this.statusReason, this.statusEducation);
    }
}

export class EduStudentActivityDescriptionObject {
    @ObjectAPI(EduStudentActivityDescription) userActivity: EduStudentActivityDescription;
}

export class EduStudentActivityDescriptionResponse {
    @ObjectAPI(EduStudentActivityDescriptionObject) response: EduStudentActivityDescriptionObject;
}

export class EduStudentCompleteActivityMessage {
    code: EduStudentCompleteMessageCode;
    text: string; // Только на русском (не используется)
}

export class GetEduStudentTaskAttemptRequest {
    firstLoad: boolean;
    typeActivity: EduActivityType;
}

export class TaskAttemptFile {
    creationDate: Date;
    name: string;
    description: string;
    file: string;
    extension: string;
    size: number;
    // ДОБАВЛЕНО:
    get id(): string {
        return this.file;
    }
}

@ArrayElementAPI(TaskAttemptFile)
export class TaskAttemptFileArray extends Array<TaskAttemptFile>  {
}


export class TaskAttemptUserFile {
    link: string;
    author: string;
    name: string;
    extension: string;
}

@ArrayElementAPI(TaskAttemptUserFile)
export class TaskAttemptUserFileArray extends Array<TaskAttemptUserFile>  {
}

export class EduStudentTaskTeacherAction {
    durationTeacherAction: number;
    @ObjectAPI(EduUserDescription) teacher: EduUserDescription;
}

export class EduStudentTaskAttempt {
    taskAttempt: string;
    userActivity: string;
    providingEducation: string;
    task: string;
    name: string; // TODO: task name
    // Вместо имя из документа подставляется имя справочника Задания
    // Либо сделать новый реквизит title, либо заменить name
    variant: string;
    variantName: string;
    @ObjectAPI(EduMark) mark: EduMark;
    percentProgress: number;
    performed: boolean;
    answerAttemptComplete: boolean;
    variantDescription: string;
    taskDescription: string;
    answerText: string;
    mustVerifiedTeacher: boolean;
    verifiedTeacher: boolean;
    teacherComment: string;
    attemptNumber: number;
    availableAttemptNumber: number;
    @ObjectAPI(TaskAttemptFileArray) taskFiles: TaskAttemptFileArray;
    @ObjectAPI(TaskAttemptFileArray) userFiles: TaskAttemptUserFileArray;
    eduTemplateName: string;
    electronicEducation: boolean;
    @ObjectAPI(EduUserDescription) user: EduUserDescription;
    toRevision: boolean;
    @ObjectAPI(EduScaleMarks) scaleMarks: EduScaleMarks;
    controlFileAnswerTask: boolean;
    eduParentTemplate: string;
    eduParentTemplateName: string;
    @DateAPI() dateToCheckTask: Date;
    reasonToRevision: string;
    @ObjectAPI(EduReasonsToRevisionArray) reasonsToRevision: EduReasonsToRevisionArray;
    @ObjectAPI(UserDescription) teacherChecked: UserDescription;
    hiddenTeachers: boolean;
    @ObjectAPI(EduStudentTaskTeacherAction) currentTeacherAction: EduStudentTaskTeacherAction;
    electronicResource: string;
    itemElectronicResource: string;
    onElectronicResource: boolean;
    onElectronicCourse: boolean;
    electronicCourse: string;
    passingScore: number;
    mustCheckEducation: boolean; // Свойство добавлено в версии 3.0.18.27 (использовать только через обертку)
    // ДОБАВЛЕНО:
    get mustScore(): boolean {
        if (("mustCheckEducation" in this) && typeof this.mustCheckEducation === 'boolean') {
            return this.mustCheckEducation;
        }
        // Для совместимости с данными до версии 3.0.18.27:
        if (this.answerAttemptComplete && !this.mark && !this.mustVerifiedTeacher) {
            return false;
        }
        return true; // Для совместимости с данными до версии 3.0.18.27
    }
    get isElectronicResource(): boolean {
        return this.onElectronicResource || this.onElectronicCourse;
    }
    get isReasonsToRevision(): boolean {
        return !!(this.reasonsToRevision && this.reasonsToRevision.length);
    }
    activityIsActual: boolean = null; // Заполняется вручную в кабинете
    get readonly(): boolean {
        if (this.activityIsActual === null) {
            // Для получения свойства readonly необходимо заполнить activityIsActual
            throw new Error("Property activityIsActual is not initiated");
        }
        if (this.answerAttemptComplete) {
            return true;
        }
        if (!this.activityIsActual) {
            return true;
        }
        return false;
    }
    // Преподаватель решил повторно проверить задание
    private teacherWantRetryVerify = false;
    retryVerify() {
        this.teacherWantRetryVerify = true;
    }
    deleteUserFile(id: string) {
        if (!this.userFiles || !this.userFiles.length) {
            return;
        }
        this.userFiles = this.userFiles.filter((val) => val.link !== id);
    }
    addUserFile(id: string, name: string, authorID: string, extension: string) {
        if (!this.userFiles) {
            this.userFiles = [];
        }
        const newFile: TaskAttemptUserFile = {
            link: id,
            author: authorID,
            name: name,
            extension: extension
        };
        this.userFiles.push(newFile);
    }
    get willBeCheckStage(): boolean {
        return (this.answerAttemptComplete && this.mustVerifiedTeacher && !this.verifiedTeacher) || this.teacherWantRetryVerify;
    }
    get toRevisionStage(): boolean {
        return !this.willBeCheckStage && this.toRevision && !this.answerAttemptComplete;
    }
    get checkedStage(): boolean {
        return !this.willBeCheckStage && this.answerAttemptComplete && this.mustVerifiedTeacher && this.verifiedTeacher;
    }
    get startStage(): boolean {
        return !this.willBeCheckStage && !this.toRevisionStage && !this.checkedStage;
    }
    get toRevisionText(): string {
        if (!this.reasonToRevision) {
            return "";
        }
        if (!this.reasonsToRevision || !this.reasonsToRevision.length) {
            return "";
        }
        const element = this.reasonsToRevision.find((val) => val.id === this.reasonToRevision);
        if (!element) {
            return "";
        }
        return element.name;
    }
    get displayTeacherArea(): boolean {
        return !this.startStage;
    }
    get studentFiles(): TaskAttemptUserFileArray {
        if (!this.userFiles) {
            return [];
        }
        return this.userFiles.filter((val) => val.author === this.user.id);
    }
    get teacherFiles(): TaskAttemptUserFileArray {
        if (!this.userFiles) {
            return [];
        }
        return this.userFiles.filter((val) => val.author !== this.user.id);
    }
    get green(): boolean {
        return this.checkedStage && this.scaleMarks.isMax(this.mark);
    }
    get red(): boolean {
        return this.toRevisionStage;
    }
    get orange(): boolean {
        return this.checkedStage && !this.scaleMarks.isMax(this.mark);
    }
    get allowCancel(): boolean {
        if (DatesTools.IsEmptyDate(this.dateToCheckTask)) {
            return false;
        }
        if (this.currentTeacherAction && this.currentTeacherAction.durationTeacherAction > 0) {
            return false;
        }
        return this.willBeCheckStage || this.toRevisionStage;
    }
    get title(): string {
        let title = this.eduTemplateName + ' • ' + this.name;
        if (!DatesTools.IsEmptyDate(this.dateToCheckTask)) {
            title += ' • ' + dayjs(this.dateToCheckTask).format('LL HH:mm');
        }
        return title;
    }
}

export class SaveTaskRequest {
    answer: string;
}

export class SaveTaskActionResult {
    descriptionUserActivity: null;
    electronicCourse: string;
    electronicResource: string;
    fragment: string;
    @ObjectAPI(EduStudentCompleteActivityMessage) message: EduStudentCompleteActivityMessage;
    percentProgress: number;
    providingEducation: string;
    taskAttempt: string;
    user: string;
    variant: string;
}

export class SaveTaskResponse {
    operationComplete: boolean;
    @ObjectAPI(SaveTaskActionResult) taskActionResult: SaveTaskActionResult;
}

export class CancelTaskAnswerResponse {
    operationComplete: boolean;
    @ObjectAPI(SaveTaskActionResult) taskActionResult: SaveTaskActionResult;
}

/* Сертификаты */

export class StudentCertificateListElement {

    id: string;
    @DateAPI() issuedWhen: Date;
    // TODO: Certificate (issuedBefore)
    // Сделать дату окончания и показывать в списке

    issuedFor: string;
    formatHTML: boolean;
    formatPDF: boolean;

    // ДОБАВЛЕНО:
    copiedToClipboard = new BehaviorSubject<boolean>(false);
    displayCommands = false;
    HTMLLink(settings: SettingsService, translate: TranslateService): string {
        if (!this.formatHTML) {
            return "";
        }
        return `${settings.CabinetURL()}/certificate.html?certificate=${this.id}&lang=${Language.get(translate)}`;
    }
    PDFLink(settings: SettingsService): string {
        if (!this.formatPDF) {
            return "";
        }
        return `${settings.ServiceURL(APIServiceNames.edu)}/edu/certificate/get/${this.id}`;
    }
    get PDFFileName(): string {
        return this.issuedWhen + ".pdf";
    }
    afterCopyToClipboard() {
        this.copiedToClipboard.next(true);
        setTimeout(() => this.copiedToClipboard.next(false), 3000);
    }
}

export class StudentCertificatesListResponseElement {
    @ObjectAPI(StudentCertificateListElement) certificate: StudentCertificateListElement;
}

@ArrayElementAPI(StudentCertificatesListResponseElement)
export class StudentCertificatesListResponse extends Array<StudentCertificatesListResponseElement> {

}

export type EduStudentCompleteMessageCode =
    "denyFinishProgress"
    | "denyFinishProgressAll"
    | "denyFinishScore"
    | "denyFinishScoreWithoutScore"
    | "denyFinishFiles"
    | "denyFinishMustVerifiedTeacher"
    | "denyFinishWhenToRevision";

export const eduStudentCompleteMessageCodes = {
    denyFinishProgress: "denyFinishProgress" as EduStudentCompleteMessageCode,
    denyFinishProgressAll: "denyFinishProgressAll" as EduStudentCompleteMessageCode,
    denyFinishScore: "denyFinishScore" as EduStudentCompleteMessageCode,
    denyFinishScoreWithoutScore: "denyFinishScoreWithoutScore" as EduStudentCompleteMessageCode,
    denyFinishFiles: "denyFinishFiles" as EduStudentCompleteMessageCode,
    denyFinishMustVerifiedTeacher: "denyFinishMustVerifiedTeacher" as EduStudentCompleteMessageCode,
    denyFinishWhenToRevision: "denyFinishWhenToRevision" as EduStudentCompleteMessageCode,
};

export class EduStudentCompleteActivityResponse {
    @ObjectAPI(EduStudentCompleteActivityMessage) message: EduStudentCompleteActivityMessage;
    requiredToFillPoll: boolean;
    status: string;
    statusAsString: string;
    calculatedStatusAsString: string;
    electronicActivityTimeExpired: number;
    percentProgress: number;
    score: number;
    parentUserActivity: string;
    nextActivity: string;
    certificate: string;
    parentActivityDescription: string;
    tasksAreAvailable: boolean;
    minProgressToUserComplete: number;
    minScoreToUserComplete: number;
    countAttachedFilesToUserComplete: number;
    countAttachedFiles: number;
}

@ArrayElementAPI(UserDescription)
export class EduStudentActivityParticipants extends Array<UserDescription> {

}

@ArrayElementAPI(TeacherUserDescription)
export class EduStudentActivityTeachers extends Array<TeacherUserDescription> {

}

/* Обучения для записи */

export type RequestStatus = "" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export const requestStatuses = {
    PENDING: "PENDING" as RequestStatus,
    APPROVED: "APPROVED" as RequestStatus,
    REJECTED: "REJECTED" as RequestStatus,
    CANCELLED: "CANCELLED" as RequestStatus,
};

export const numberToRequestStatus = (statusNumber: number): RequestStatus => {
    switch (statusNumber) {
        case 1:
            return requestStatuses.PENDING;
        case 2:
            return requestStatuses.APPROVED;
        case 3:
            return requestStatuses.REJECTED;
        case 4:
            return requestStatuses.CANCELLED;
        default:
            return "";
    }
};

export class StudentOptionalActivityListElement extends EduActivity {
    get requiredRequest(): boolean {
        return this.type === eduActivityTypes.applicationToEducation;
    }
    get isHidden(): boolean {
        if (this.userActivity) {
            return true; // Скрываем, если пользователь уже зачислен на обучение.
        }
        if (!DatesTools.IsEmptyDate(this.startDateEntryActivity)
            && (new Date()).getTime() < this.startDateEntryActivity.getTime()) {
            return true; // Скрываем, если дата начала записи еще не настала.
        }
        if (!DatesTools.IsEmptyDate(this.endDateEntryActivity)
            && (new Date()).getTime() > this.endDateEntryActivity.getTime()) {
            return true; // Скрываем, если дата окончания записи уже прошла.
        }
        return false;
    }
    imagePath(settings: SettingsService): string {
        if (!this.image) {
            return "";
        }
        return settings.ImageURL(this.image).split("\\").join("/");
    }
    get displayEntryPeriod(): boolean {
        return !DatesTools.IsEmptyDate(this.startDateEntryActivity)
            || !DatesTools.IsEmptyDate(this.endDateEntryActivity);
    }
    get displayEducationPeriod(): boolean {
        return !DatesTools.IsEmptyDate(this.startDate)
            || !DatesTools.IsEmptyDate(this.endDate);
    }
    get displayDurationBySeconds(): boolean {
        return (this.durationVariant === durationVariants.FROM_EDU_START
            || this.durationVariant === durationVariants.FROM_ENROLLMENT) && !!this.durationBySeconds;
    }
}

export class StudentOptionalActivityResponseElement {
    @ObjectAPI(StudentOptionalActivityListElement) object: StudentOptionalActivityListElement;
}

@ArrayElementAPI(StudentOptionalActivityResponseElement)
export class StudentOptionalActivitiesResponse extends Array<StudentOptionalActivityResponseElement> {

}

export class StudentOptionalRequestDataApplicationElement {
    additionalInformation: null; // TODO additionalInformation
    comment: string;
    @DateAPI() date: Date;
    id: string;
    @DateAPI() reviewDate: Date;
    @ConvertValueAPI(numberToRequestStatus) status: RequestStatus;
    text: string;
    user: string;
}

export class StudentOptionalRequestDataElement {
    @ObjectAPI(StudentOptionalRequestDataApplicationElement) application: StudentOptionalRequestDataApplicationElement;
}

@ArrayElementAPI(StudentOptionalRequestDataElement)
export class StudentOptionalRequestData extends Array<StudentOptionalRequestDataElement> {

}

export class StudentOptionalEntryDescription {
    @DateAPI() startDateEntryActivity: Date;
    @DateAPI() endDateEntryActivity: Date;
    description: string;
    additionalInformation: null; // TODO additionalInformation
    // ДОБАВЛЕНО:
    get displayEntryPeriod(): boolean {
        return !DatesTools.IsEmptyDate(this.startDateEntryActivity)
            || !DatesTools.IsEmptyDate(this.endDateEntryActivity);
    }
}

export class StudentOptionalEntryData {
    @ObjectAPI(StudentOptionalEntryDescription) descriptionOpenEducation: StudentOptionalEntryDescription;
    id: string;
    name: string;
    opened: boolean;
}

export interface NewRequestFormData {
    text: string;
    isSaving: boolean;
}

export class StudentDirectEntryResponse {
    isErrors: boolean;
    textError: string;
    userActivity: string;
    codeError: string;
}

export class NewRequestData {
    text: string;
}

export class NewRequestResponse {
    request: string;
}

export class SavePollRequest {
    mark?: number;
    comment?: string;
}

export class SavePollResponse {
    operationComplete: boolean;
}

export interface QualityPollFormData {
    comment: string;
    mark: number;
    isSaving: boolean;
    user: UserDescription;
}

export function translateStudentScorePostfix(translate: TranslateService, score: number): Observable<string> {
    return translate.get([
        'STUDENT_ACTIVITY.SCORE_POSTFIX.SCORE_1',
        'STUDENT_ACTIVITY.SCORE_POSTFIX.SCORE_2',
        'STUDENT_ACTIVITY.SCORE_POSTFIX.SCORE_5',
    ]).pipe(map((labels) => {
        return NumbersTools.declensionNumber(score,
            [
                labels['STUDENT_ACTIVITY.SCORE_POSTFIX.SCORE_1'],
                labels['STUDENT_ACTIVITY.SCORE_POSTFIX.SCORE_2'],
                labels['STUDENT_ACTIVITY.SCORE_POSTFIX.SCORE_5']
            ]);
    }));

}
