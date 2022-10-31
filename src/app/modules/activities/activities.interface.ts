import { DateAPI, ArrayElementAPI, ObjectAPI, ConvertValueAPI, DateAsStringAPI } from "@modules/root/api/api.converter";
import { throwError, Observable, BehaviorSubject } from 'rxjs';
import { UserDescription } from '@modules/user/user.interface';
import { SettingsService } from '@modules/root/settings/settings.service';
import { DatesTools } from '@modules/root/dates/dates.class';
import { map } from 'rxjs/operators';


export type EduActivityType = "education" | "teaching" | "type" | "entryToEducation" | "applicationToEducation";

export const eduActivityTypes = {
    education: "education" as EduActivityType,
    teaching: "teaching" as EduActivityType,
    type: "type" as EduActivityType,
    entryToEducation: "entryToEducation" as EduActivityType,
    applicationToEducation: "applicationToEducation" as EduActivityType,
};

export const textToActivityType = (text: string): EduActivityType => {
    switch (text) {
        case "Преподавание":
            return eduActivityTypes.teaching;
        case "Обучение":
            return eduActivityTypes.education;
        case "ВидОбучения":
            return eduActivityTypes.type;
        case "ЗаписьНаОбучение":
            return eduActivityTypes.entryToEducation;
        case "ЗаявкаНаОбучение":
            return eduActivityTypes.applicationToEducation;
        default:
            throwError("Activity type not found");
    }
};

export const displayDurationFromStart = function(statusEducation: EduStatus, durationVariant: DurationVariant, durationBySeconds: number) {
    return (statusEducation === eduStatuses.NEW || statusEducation === eduStatuses.SCHEDULED)
        && (durationVariant === durationVariants.FROM_EDU_START || durationVariant === durationVariants.FROM_ENROLLMENT)
        && !!durationBySeconds;
}

export type EduStatus = "" | "SCHEDULED" | "NEW" | "ACTIVE" | "COMPLETED" | "INCOMPLETE" | "VERIFIED" | "TO_REVISION" | "NOT_ADMITTED" | "COMPLETED_NOT_VERIFIED" | "AUTO";

// Порядок статусов влияет на порядок статусов в списке обучений
// при сортировке по статусу.

export const eduStatuses = {
    NEW: "NEW" as EduStatus, // Зеленый
    ACTIVE: "ACTIVE" as EduStatus, // Оранжевый
    TO_REVISION: "TO_REVISION" as EduStatus, // Красный
    SCHEDULED: "SCHEDULED" as EduStatus, // Серый
    AUTO: "AUTO" as EduStatus, // Серый
    VERIFIED: "VERIFIED" as EduStatus, // Серый
    COMPLETED: "COMPLETED" as EduStatus, // Серый
    COMPLETED_NOT_VERIFIED: "COMPLETED_NOT_VERIFIED" as EduStatus, // Серый
    INCOMPLETE: "INCOMPLETE" as EduStatus, // Серый
    NOT_ADMITTED: "NOT_ADMITTED" as EduStatus, // Серый
};

export const activityWasStarting = (electronicAndRemote: boolean, statusEducation: EduStatus): boolean => {
    if (!electronicAndRemote) {
        return false;
    }
    if (statusEducation === eduStatuses.ACTIVE) {
        return true;
    }
    if (statusEducation === eduStatuses.COMPLETED) {
        return true;
    }
    if (statusEducation === eduStatuses.COMPLETED_NOT_VERIFIED) {
        return true;
    }
    if (statusEducation === eduStatuses.INCOMPLETE) {
        return true;
    }
    if (statusEducation === eduStatuses.TO_REVISION) {
        return true;
    }
    if (statusEducation === eduStatuses.VERIFIED) {
        return true;
    }
    return false;
}
export const activityWasEnding = (electronicAndRemote: boolean, statusEducation: EduStatus): boolean => {
    if (!electronicAndRemote) {
        return false;
    }
    if (statusEducation === eduStatuses.COMPLETED) {
        return true;
    }
    if (statusEducation === eduStatuses.COMPLETED_NOT_VERIFIED) {
        return true;
    }
    return false;
}

export const numberToEduStatus = (statusNumber: number): EduStatus => {
    switch (statusNumber) {
        case 1:
            return eduStatuses.SCHEDULED;
        case 2:
            return eduStatuses.NEW;
        case 3:
            return eduStatuses.ACTIVE;
        case 4:
            return eduStatuses.COMPLETED;
        case 5:
            return eduStatuses.INCOMPLETE;
        case 6:
            return eduStatuses.VERIFIED;
        case 7:
            return eduStatuses.TO_REVISION;
        case 8:
            return eduStatuses.NOT_ADMITTED;
        case 9:
            return eduStatuses.COMPLETED_NOT_VERIFIED;
        case 10:
            return eduStatuses.AUTO;
        default:
            return "";
    }
};

export type EduActivityStatus = "" | "ENROLLED" | "IN_PROGRESS" | "FINISHED" | "NOT_FINISHED" | "NOT_ADMITTED" | "AUTO";
export const eduActivityStatuses = {
    ENROLLED: "ENROLLED" as EduActivityStatus,
    IN_PROGRESS: "IN_PROGRESS" as EduActivityStatus,
    FINISHED: "FINISHED" as EduActivityStatus,
    NOT_FINISHED: "NOT_FINISHED" as EduActivityStatus,
    NOT_ADMITTED: "NOT_ADMITTED" as EduActivityStatus,
    AUTO: "AUTO" as EduActivityStatus,
};

export const EduActivityStatusToNumber = (status: EduActivityStatus): number => {
    switch (status) {
        case eduActivityStatuses.ENROLLED:
            return 1;
        case eduActivityStatuses.IN_PROGRESS:
            return 2;
        case eduActivityStatuses.FINISHED:
            return 3;
        case eduActivityStatuses.NOT_FINISHED:
            return 4;
        case eduActivityStatuses.NOT_ADMITTED:
            return 5;
        case eduActivityStatuses.AUTO:
            return 6;
        default:
            return null;
    }
};

export const numberToEduActivityStatus = (statusNumber: number): EduActivityStatus => {
    switch (statusNumber) {
        case 1:
            return eduActivityStatuses.ENROLLED;
        case 2:
            return eduActivityStatuses.IN_PROGRESS;
        case 3:
            return eduActivityStatuses.FINISHED;
        case 4:
            return eduActivityStatuses.NOT_FINISHED;
        case 5:
            return eduActivityStatuses.NOT_ADMITTED;
        case 6:
            return eduActivityStatuses.AUTO;
        default:
            return "";
    }
};

export type DurationVariant = "" | "STATIC" | "FROM_EDU_START" | "FROM_ENROLLMENT" | "NOT_SET";

export const durationVariants = {
    STATIC: "STATIC" as DurationVariant,
    FROM_EDU_START: "FROM_EDU_START" as DurationVariant,
    FROM_ENROLLMENT: "FROM_ENROLLMENT" as DurationVariant,
    NOT_SET: "NOT_SET" as DurationVariant,
};

export const numberToDurationVariant = (durationNumber: number): DurationVariant => {
    switch (durationNumber) {
        case 1:
            return durationVariants.NOT_SET;
        case 2:
            return durationVariants.STATIC;
        case 3:
            return durationVariants.FROM_EDU_START;
        case 4:
            return durationVariants.FROM_ENROLLMENT;
        default:
            return "";
    }
};


export type StatusTeacherActivity = "" | "SCHEDULED" | "IN_PROGRESS" | "FINISHED" | "COMPLETED";
export const statusesTeacherActivity = {
    SCHEDULED: "SCHEDULED" as StatusTeacherActivity,
    IN_PROGRESS: "IN_PROGRESS" as StatusTeacherActivity,
    FINISHED: "FINISHED" as StatusTeacherActivity,
    COMPLETED: "COMPLETED" as StatusTeacherActivity,
};

export const StatusTeacherActivityToNumber = (status: StatusTeacherActivity): number => {
    switch (status) {
        case statusesTeacherActivity.SCHEDULED:
            return 1;
        case statusesTeacherActivity.IN_PROGRESS:
            return 2;
        case statusesTeacherActivity.FINISHED:
            return 3;
        case statusesTeacherActivity.COMPLETED:
            return 4;
        default:
            return null;
    }
};

export const numberToStatusTeacherActivity = (statusNumber: number): StatusTeacherActivity => {
    switch (statusNumber) {
        case 1:
            return statusesTeacherActivity.SCHEDULED;
        case 2:
            return statusesTeacherActivity.IN_PROGRESS;
        case 3:
            return statusesTeacherActivity.FINISHED;
        case 4:
            return statusesTeacherActivity.COMPLETED;
        default:
            return "";
    }
};

export const statusTeacherActivityToColor = (status: StatusTeacherActivity): string => {
    switch (status) {
        case statusesTeacherActivity.SCHEDULED:
            return "";
        case statusesTeacherActivity.IN_PROGRESS:
            return "success";
        case statusesTeacherActivity.FINISHED:
            return "warning";
        case statusesTeacherActivity.COMPLETED:
            return "warning";
        default:
            return "";
    }
};


export type StatusReason = "NOT_ACHIEVE_PASSING_SCORE"
    | "NOT_ACHIEVE_PROGRESS"
    | "NOT_ACHIEVE_PASSING_SCORE_WITHIN_TIME"
    | "TEACHER_DECISION"
    | "MANAGER_DECISION"
    | "STUDENT_DECISION"

export const statusReasons: {[key in StatusReason]: StatusReason} = {
    NOT_ACHIEVE_PASSING_SCORE: "NOT_ACHIEVE_PASSING_SCORE", // НеНабранПроходнойБалл
    NOT_ACHIEVE_PROGRESS: "NOT_ACHIEVE_PROGRESS", // ПройденоНеПолностьюЗаОтведенноеВремя
    NOT_ACHIEVE_PASSING_SCORE_WITHIN_TIME: "NOT_ACHIEVE_PASSING_SCORE_WITHIN_TIME", // НеНабранПроходнойБаллЗаОтведенноеВремя
    TEACHER_DECISION: "TEACHER_DECISION", // РешениеПреподавателя
    MANAGER_DECISION: "MANAGER_DECISION", // РешениеАдминистрации
    STUDENT_DECISION: "STUDENT_DECISION", // РешениеОбучающегося
};

export const numberToStatusReason = (statusReasonNumber: number): StatusReason | "" => {
  switch (statusReasonNumber) {
    case 1:
      return statusReasons.NOT_ACHIEVE_PASSING_SCORE;
    case 2:
      return statusReasons.NOT_ACHIEVE_PROGRESS;
    case 3:
      return statusReasons.NOT_ACHIEVE_PASSING_SCORE_WITHIN_TIME;
    case 4:
      return statusReasons.TEACHER_DECISION;
    case 5:
      return statusReasons.MANAGER_DECISION;
    case 6:
      return statusReasons.STUDENT_DECISION;
    default:
      return "";
  }
};

export const statusReasonToDisplay = (statusReason: StatusReason, statusEducation: EduStatus): StatusReason | undefined => {
    if (statusEducation !== eduStatuses.INCOMPLETE) {
        return undefined;
    }
    if (statusReason === statusReasons.STUDENT_DECISION) {
        return undefined;
    }
    return (statusReason) ? statusReason : undefined;
}

export const colorToWebColor = (color: string): string => {
    if (typeof color === "string") {
        color = color.trim();
    }
    if (color) {
        return `#${color}`;
    }
    return "";
};

export class EduMark {
    name: string;
    id: string;
    score: number;
}

export class EduScaleMarks {
    name: string;
    id: string;
    marks: EduMark[] | { mark: EduMark[] };
    // ДОБАВЛЕНО:
    get marksArray(): EduMark[] {
        if (Array.isArray(this.marks)) {
            return this.marks;
        }
        if ('mark' in this.marks) {
            return this.marks.mark;
        }
        return [];
    }
    getValue(mark: EduMark): number | string {
        if (!mark) {
            if (this.displayAsNumber) {
                return 0;
            } else {
                return "";
            }
        }
        if (this.displayAsNumber) {
            return Number(mark.name);
        } else {
            return mark.id;
        }
    }
    idByValue(value: number | string): string {
        const mark = this.getByValue(value);
        return (mark) ? mark.id : "";
    }
    getByValue(value: number | string): EduMark {
        if (!this.marksArray) {
            return null;
        }
        if (!value) {
            return null;
        }
        if (typeof value === 'number') {
            if (value < 0) {
                value = 0;
            }
            if (value > 100) {
                value = 100;
            }
            const markByName = this.getByName(String(value));
            if (markByName) {
                return markByName;
            } else {
                return null;
            }
        } else {
            return this.marksArray.find((val) => val.id === String(value).trim());
        }
    }
    getByName(name: string): EduMark {
        if (!this.marksArray) {
            return null;
        }
        if (!name) {
            return null;
        }
        return this.marksArray.find((val) => String(val.name) === String(name).trim());
    }
    isMax(mark: EduMark): boolean {
        if (!this.marksArray || !mark) {
            return false;
        }
        const makIndex = this.marksArray.findIndex((val) => val.id === mark.id);
        return makIndex + 1 === this.marksArray.length;
    }
    getMax(): EduMark {
        if (!this.marksArray || !this.marksArray.length) {
            return undefined;
        }
        return this.marksArray[this.marksArray.length - 1];
    }
    passing(passingScore: number): EduMark {
        const marksArray = this.marksArray;
        if (!marksArray.length || !passingScore) {
            return null;
        }
        return marksArray.find((val) => val.score >= passingScore);
    }
    get displayAsNumber(): boolean {
        return (!!this.marksArray && this.marksArray.length === 101);
    }
    get displayAsSelect(): boolean {
        return (!!this.marksArray && this.marksArray.length > 2 && this.marksArray.length !== 101);
    }
    get displayAsOneButton(): boolean {
        return (!this.marksArray || this.marksArray.length === 1);
    }
    get displayAsTwoButtons(): boolean {
        return (!!this.marksArray && this.marksArray.length === 2);
    }
}


export class EduTask {
    task: string;
    onElectronicResource: boolean;
    electronicResource: string;
    fragment: string;
    name: string;
    onElectronicCourse: boolean;
    electronicCourse: string;
}

export class EduChildTemplate {
    templateActivity: string;
    importance: number;
    teacherRole: string;
    durationBySeconds: number;
    classroom: string;
    dateProvidingEducation: number;
    kind: string;
    isElectronic: boolean;
    location: string;
    additionalTeachers: null; // TODO: additionalTeachers
    needTeacher: boolean;
    name: string;
    typeRoom: string;
    numberTemplateActivity: number;
}

@ArrayElementAPI(EduChildTemplate)
export class EduChildTemplateArray extends Array<EduChildTemplate> {

}

export function durationLeft(
    actual: boolean,
    durationVariant: DurationVariant,
    statusEducation: EduStatus,
    durationBySeconds: number,
    startDuration: Date,
    endDateActivity: Date): number {

    // При изменении логики работы этой функции следует
    // поменять ее и на закладке Участники документа Проведение обучения в 1С
    // и в функции ОсталосьВремениВСекундах документа ПрохождениеОбученияСУО.

    const currentDateBySeconds = DatesTools.currentDateBySeconds();

    if (!actual) {
        return 0;
    }

    if (statusEducation === eduStatuses.SCHEDULED) {
        return 0;
    }

    if (statusEducation === eduStatuses.NEW && durationVariant === durationVariants.FROM_EDU_START) {
        return 0;
    }

    if (durationVariant === durationVariants.STATIC
        && !DatesTools.IsEmptyDate(endDateActivity)) {

        const endDateActivityBySeconds = Math.round(endDateActivity.getTime() / 1000);
        if (currentDateBySeconds > endDateActivityBySeconds) {
            return -1;
        }

    }

    if (durationVariant !== durationVariants.FROM_EDU_START
        && durationVariant !== durationVariants.FROM_ENROLLMENT) {
        return 0;
    }

    if (!durationBySeconds || DatesTools.IsEmptyDate(startDuration)) {
        return 0;
    }


    const startDateBySeconds = Math.round(startDuration.getTime() / 1000);
    const endDateBySeconds = startDateBySeconds + durationBySeconds;

    if (startDateBySeconds > currentDateBySeconds) {
        return 0;
    }

    if (currentDateBySeconds > endDateBySeconds) {
        return -1; // Время истекло
    }

    return endDateBySeconds - currentDateBySeconds;

}

export class EduActivityFilterParam {
    id: string;
    name: string;
}

export class EduActivity {
    @ConvertValueAPI(textToActivityType) type: EduActivityType;
    id: string;
    name: string;
    @DateAPI() startDate: Date;
    @DateAPI() endDate: Date;
    @DateAPI() startDateUserActivity: Date;
    @DateAPI() endDateUserActivity: Date;
    electronicAndRemote: boolean;
    @ConvertValueAPI(numberToEduStatus) statusEducation: EduStatus;
    actual: boolean;
    singleTask: EduTask;
    commentForParticipant: string;
    @ConvertValueAPI(colorToWebColor) color: string;
    hideEduDate: boolean; // Deprecated
    parentActivity: string;
    @ObjectAPI(EduChildTemplateArray) childActivities: EduChildTemplateArray;
    // Здесь правильно было бы назвать свойство childTemplates
    // Свойство нужно, чтобы показать обучения, на которые человек
    // еще не зачислен. Показываем только данные шаблона, без доступа к обучению.
    eduTemplate: string;
    allowUserComplete: boolean;
    userActivity: string;
    @DateAPI() startDateEntryActivity: Date;
    @DateAPI() endDateEntryActivity: Date;
    numberTemplateActivity: number;
    indexNumber: number;
    @DateAPI() lastActivityDate: Date;
    image: string;
    conducted: boolean;
    @ConvertValueAPI(numberToStatusTeacherActivity) statusTeacherActivity: StatusTeacherActivity;
    @ObjectAPI(EduMark) mark: EduMark;
    percentProgress: number;
    score: number;
    @DateAPI() startDuration: Date;
    durationBySeconds: number;
    @ConvertValueAPI(numberToDurationVariant) durationVariant: DurationVariant;
    averageQualityPollResult: number;
    countQualityPollResults: number;
    providingEducation: string; // Доступно с версии КУ 3.0.12.68
    @ObjectAPI(EduActivityFilterParam) module: EduActivityFilterParam; // Добавлено в 3.0.14.2
    @ObjectAPI(EduActivityFilterParam) subject: EduActivityFilterParam; // Добавлено в 3.0.14.2
    @ObjectAPI(EduActivityFilterParam) kindEducation: EduActivityFilterParam; // Добавлено в 3.0.14.2
    @ConvertValueAPI(numberToStatusReason) statusReason: StatusReason; // Добавлено в 3.0.17
    // ДОБАВЛЕНО:
    get isAnyDates(): boolean {
        if (!DatesTools.IsEmptyDate(this.startDate)) {
            return true;
        }
        if (!DatesTools.IsEmptyDate(this.endDate)) {
            return true;
        }
        return false;
    }
    get teacherStatus(): StatusTeacherActivity {
        if (this.statusTeacherActivity) {
            return this.statusTeacherActivity;
        }
        // Для совместимости с КУ, в которой нет свойства statusTeacherActivity:
        return (this.conducted) ? statusesTeacherActivity.FINISHED : statusesTeacherActivity.IN_PROGRESS;
    }
    get startDateToCalendar(): Date {
        if (this.type === eduActivityTypes.entryToEducation || this.type === eduActivityTypes.applicationToEducation) {
            return new Date(0);
        }
        if (!DatesTools.IsEmptyDate(this.startDate)) {
            return this.startDate;
        }
        if (!DatesTools.IsEmptyDate(this.startDateUserActivity)) {
            return this.startDateUserActivity;
        }
        return new Date(0);
    }
    get endDateToCalendar(): Date {
        if (this.type === eduActivityTypes.entryToEducation || this.type === eduActivityTypes.applicationToEducation) {
            return new Date(0);
        }
        if (!DatesTools.IsEmptyDate(this.endDate)) {
            return this.endDate;
        }
        if (!DatesTools.IsEmptyDate(this.endDateUserActivity)) {
            return this.endDateUserActivity;
        }
        return new Date(0);
    }
    get colorToCalendar(): string {
        if (this.color) {
            return this.color;
        }
        if (!this.actual) {
            return "#E6E6E6";
        }
        return "";
    }
    get displayContinueCommand(): boolean {
        return this.singleTask
            && (this.singleTask.onElectronicResource || this.singleTask.onElectronicCourse)
            && this.statusEducation === eduStatuses.ACTIVE;
    }
    imagePath(settings: SettingsService): string {
        if (!this.image) {
            return "";
        }
        return settings.ImageURL(this.image);
    }

    get durationLeft(): number {
        return durationLeft(
            this.actual,
            this.durationVariant,
            this.statusEducation,
            this.durationBySeconds,
            this.startDuration,
            this.endDate
            );
    }
    private _durationLeft$ = new BehaviorSubject(-2);
    private updateDurationLeft() {
        this._durationLeft$.next(this.durationLeft);
    }
    constructor() {
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
    get wasStarting(): boolean {
        return activityWasStarting(this.electronicAndRemote, this.statusEducation);
    }
    get wasEnding(): boolean {
        return activityWasEnding(this.electronicAndRemote, this.statusEducation);
    }
    get displayDurationFromStart(): boolean {
        return displayDurationFromStart(this.statusEducation, this.durationVariant, this.durationBySeconds);
    }
    get statusReasonToDisplay(): StatusReason | undefined {
        if (!("statusReason" in this)) {
            return undefined;
        }
        return statusReasonToDisplay(this.statusReason, this.statusEducation);
    }
}

export class EduActivityObject {
    @ObjectAPI(EduActivity) object: EduActivity;
}

@ArrayElementAPI(EduActivityObject)
export class EduObjectActivities extends Array<EduActivityObject> {
    // ДОБАВЛЕНО:
    get allActivities(): EduActivity[] {
        const activities = this.map((val) => val.object);
        DatesTools.sortByDate(activities, val => val.startDate, false, true, val => val.statusEducation === eduStatuses.TO_REVISION, val => val.name);
        return activities;
    }
    get allEducation(): EduActivity[] {
        return this.allActivities.filter((val) => val.type === eduActivityTypes.education);
    }
    get allTeaching(): EduActivity[] {
        return this.allActivities.filter((val) => val.type === eduActivityTypes.teaching);
    }
    get shortTeaching(): EduActivity[] {

        const shortList: EduActivity[] = [];

        const maxElements = 5;
        const allEducation = this.allTeaching;

        const lists: EduActivity[][] = [];
        lists.push(allEducation.filter(val => val.teacherStatus === statusesTeacherActivity.IN_PROGRESS));
        lists.push(allEducation.filter(val => val.teacherStatus === statusesTeacherActivity.SCHEDULED));
        lists.push(allEducation.filter(val => !val.conducted));
        lists.push(allEducation);

        for (const currentList of lists) {
            for (const currentEducation of currentList) {
                if (shortList.length >= maxElements) {
                    break;
                }
                if (shortList.findIndex(val => val.id === currentEducation.id) > -1) {
                    continue;
                }
                shortList.push(currentEducation);
            }
        }

        return shortList;

    }
    get shortEducation(): EduActivity[] {

        const shortList: EduActivity[] = [];

        const maxElements = 5;
        const allEducation = this.allEducation.filter(val => !val.childActivities); // Все НЕ общие

        const lists: EduActivity[][] = [];
        lists.push(allEducation.filter(val => val.statusEducation === eduStatuses.TO_REVISION));
        lists.push(allEducation.filter(val => val.statusEducation === eduStatuses.ACTIVE));
        lists.push(allEducation.filter(val => val.statusEducation === eduStatuses.NEW));
        lists.push(allEducation.filter(val => val.statusEducation === eduStatuses.SCHEDULED));
        lists.push(allEducation);

        for (const currentList of lists) {
            for (const currentEducation of currentList) {
                if (shortList.length >= maxElements) {
                    break;
                }
                if (shortList.findIndex(val => val.id === currentEducation.id) > -1) {
                    continue;
                }
                shortList.push(currentEducation);
            }
        }

        return shortList;

    }
    get primaryEducationActivity(): EduActivity {

        const all = this.allEducation.filter(val => val.durationLeft > -1); // Исключаем те, где закончилось время
        let primary: EduActivity = null;

        // Ищем первое возвращенное на доработку

        if (!primary) {
            for (const current of all) {

                if (current.statusEducation !== eduStatuses.TO_REVISION) {
                    continue;
                }
                if (!primary
                    || DatesTools.IsEmptyDate(primary.lastActivityDate)
                    || current.startDate.getTime() < primary.startDate.getTime()) {
                    primary = current;
                    continue;
                }
            }
        }

        // Ищем последнее обучение с кнопкой Продолжить

        if (!primary) {
            for (const current of all) {

                if (!current.displayContinueCommand) {
                    continue;
                }
                if (!primary
                    || DatesTools.IsEmptyDate(primary.lastActivityDate)
                    || primary.lastActivityDate.getTime() < current.lastActivityDate.getTime()) {
                    primary = current;
                    continue;
                }
            }
        }

        // Ищем первое новое обучение

        if (!primary) {
            for (const current of all) {
                if (current.statusEducation !== eduStatuses.NEW) {
                    continue;
                }
                if (!primary
                    || DatesTools.IsEmptyDate(primary.lastActivityDate)
                    || current.startDate.getTime() < primary.startDate.getTime()) {
                    primary = current;
                    continue;
                }

            }
        }

        // Ищем первое активное обучение

        if (!primary) {
            for (const current of all) {
                if (current.statusEducation !== eduStatuses.ACTIVE) {
                    continue;
                }
                if (!primary
                    || current.startDate.getTime() < primary.startDate.getTime()) {
                    primary = current;
                    continue;
                }
            }
        }

        return primary;
    }
}




export class EduElectronicResource {
    id: string;
    name: string;
}

@ArrayElementAPI(EduElectronicResource)
export class EduElectronicResourcesArray extends Array<EduElectronicResource> {
}

export class EduElectronicResources {
    @ObjectAPI(EduElectronicResourcesArray) electronicResource: EduElectronicResourcesArray;
}

export class EduFile {
    id: string;
    name: string;
    extension: string;
    size: number;
}

@ArrayElementAPI(EduFile)
export class EduFilesArray extends Array<EduFile>  {
}

export class EduFiles {
    @ObjectAPI(EduFilesArray) file: EduFilesArray;
}

export class EduBookAuthor {
    personalName: string;
    number: number;
}

@ArrayElementAPI(EduBookAuthor)
export class EduBookAuthorArray extends Array<EduBookAuthor> {

}

export class EduBook {
    id: string;
    name: string;
    @ObjectAPI(EduBookAuthorArray) authors: EduBookAuthorArray;
}

@ArrayElementAPI(EduBook)
export class EduBooksArray extends Array<EduBook> {

}

export class EduBooks {
    @ObjectAPI(EduBooksArray) book: EduBooksArray;
}

export class EduResources {
    @ObjectAPI(EduElectronicResources) electronicResources: EduElectronicResources;
    @ObjectAPI(EduFiles) files: EduFiles;
    @ObjectAPI(EduBooks) books: EduBooks;
    // ДОБАВЛЕНО:
    get filesArray(): EduFile[] {
        if (!this.files) {
            return [];
        }
        if (!this.files.file) {
            return [];
        }
        if (!this.files.file.length) {
            return [];
        }
        return this.files.file;
    }
    get booksArray(): EduBook[] {
        if (!this.books) {
            return [];
        }
        if (!this.books.book) {
            return [];
        }
        if (!this.books.book.length) {
            return [];
        }
        return this.books.book;
    }
    get electronicResourceArray(): EduElectronicResource[] {
        if (!this.electronicResources) {
            return [];
        }
        if (!this.electronicResources.electronicResource) {
            return [];
        }
        if (!this.electronicResources.electronicResource.length) {
            return [];
        }
        return this.electronicResources.electronicResource;
    }
    get isResources(): boolean {
        return !!this.filesArray.length
            || !!this.booksArray.length
            || !!this.electronicResourceArray.length;
    }
}

/* Такое описание пользователя используется в XML описании обучений,
но оно конвертируется в общий формат UserDescription при помощи функции eduUserToUserDescription */
export class EduUser {
    fullName: string;
    link: string;
    avatar: string;
}

export const eduUserToUserDescription = (eduUser: EduUser): UserDescription => {
    const user = new UserDescription();
    user.name = eduUser.fullName;
    user.id = eduUser.link;
    user.avatar = eduUser.avatar;
    return user;
};

export class EduUserDescription extends UserDescription {
}

export class EduTemplate {
    type: string;
    name: string;
    id: string;
}

export class EduReasonToRevision {
    name: string;
    id: string;
}

@ArrayElementAPI(EduReasonToRevision)
export class EduReasonsToRevisionArray extends Array<EduReasonToRevision>  {
}


export type EducationPageBlockName = "activities" | "certificates" | "optionalActivities";

export const educationPageBlockNames = {
    activities: "activities" as EducationPageBlockName,
    certificates: "certificates" as EducationPageBlockName,
    optionalActivities: "optionalActivities" as EducationPageBlockName,
};

export type StudentActivityPageBlockName = "description" | "userFiles" | "tasks" | "task"
    | "quizResults" | "resources" | "teachers" | "students" | "poll" | "pollResults";

export const studentActivityPageBlockNames = {
    description: "description" as StudentActivityPageBlockName,
    userFiles: "userFiles" as StudentActivityPageBlockName,
    tasks: "tasks" as StudentActivityPageBlockName,
    task: "task" as StudentActivityPageBlockName,
    quizResults: "quizResults" as StudentActivityPageBlockName,
    resources: "resources" as StudentActivityPageBlockName,
    teachers: "teachers" as StudentActivityPageBlockName,
    students: "students" as StudentActivityPageBlockName,
    poll: "poll" as StudentActivityPageBlockName,
    pollResults: "pollResults" as StudentActivityPageBlockName
};

export type TeachingPageBlockName = "activities" | "tasks" | "reports";

export const teachingPageBlockNames = {
    activities: "activities" as TeachingPageBlockName,
    tasks: "tasks" as TeachingPageBlockName,
    reports: "reports" as TeachingPageBlockName,
};

export type TeacherActivityPageBlockName = "description" | "resources" | "teachers" | "checkList" | "reports";

export const teacherActivityPageBlockNames = {
    description: "description" as TeacherActivityPageBlockName,
    resources: "resources" as TeacherActivityPageBlockName,
    teachers: "teachers" as TeacherActivityPageBlockName,
    checkList: "checkList" as TeacherActivityPageBlockName,
    reports: "reports" as TeacherActivityPageBlockName,
};

export type TeacherTaskPageBlockName = "answer" | "mark" | "description";

export const teacherTaskPageBlockNames = {
    answer: "answer" as TeacherTaskPageBlockName,
    mark: "mark" as TeacherTaskPageBlockName,
    description: "description" as TeacherTaskPageBlockName,
};

export type StudentTaskPageBlockName = "answer" | "mark" | "description";

export const studentTaskPageBlockNames = {
    answer: "answer" as StudentTaskPageBlockName,
    mark: "mark" as StudentTaskPageBlockName,
    description: "description" as StudentTaskPageBlockName,
};

export class EduEducationRecording {
    name: string;
    webAddress: string;
    isVideo: boolean;
    isHTML: boolean;
}

@ArrayElementAPI(EduEducationRecording)
export class EduEducationRecordingsArray extends Array<EduEducationRecording> {

}

export class EduEducationRecordings {
    @ObjectAPI(EduEducationRecordingsArray) educationRecording: EduEducationRecordingsArray;
}

export class ActivityPluginService {
    webAddress: string;
    processServiceData: boolean;
    id: string;
    @ObjectAPI(EduEducationRecordings) educationRecordings: EduEducationRecordings;
    // ДОБАВЛЕНО:
    get recordingsArray(): EduEducationRecording[] {
        if (!this.educationRecordings) {
            return [];
        }
        if (!this.educationRecordings.educationRecording) {
            return [];
        }
        if (!this.educationRecordings.educationRecording.length) {
            return [];
        }
        return this.educationRecordings.educationRecording;
    }
}

export class ActivityPluginServiceProcessRequest {
    webAddress: string;
    isModerator: boolean;
}

export class ActivityPluginServiceProcessResponseParams {
    @DateAsStringAPI() startDate: string;
    timeToTest: number;
    @DateAsStringAPI() dateProvidingEducation: string;
}

export class ActivityPluginServiceProcessResponse {
    webAddress: string;
    success: boolean;
    codeError: string;
    textError: string;
    @ObjectAPI(ActivityPluginServiceProcessResponseParams) parameters: ActivityPluginServiceProcessResponseParams;
}