import { EduScaleMarks, EduTemplate, EduResources, numberToStatusTeacherActivity, StatusTeacherActivity, statusesTeacherActivity, ActivityPluginService } from '../activities.interface';
import { ObjectAPI, DateAPI, ArrayElementAPI, ConvertValueAPI } from '@modules/root/api/api.converter';
import { DatesTools } from '@modules/root/dates/dates.class';
import { convertSpentTimeDisplayOptions, EduStudentActivityDescription, EduStudentTaskAttempt, SaveTaskActionResult, SpentTimeDisplayOptions } from '../student/student.interface';
import { TeacherUserDescription, UserDescription } from '@modules/user/user.interface';
import { SettingsService } from '@modules/root/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NumbersTools } from '@modules/root/numbers/numbers.class';

// Описание карточки обучения преподавателя
//

export class EduTeacherActivityDescription {
    periodAsString: string;
    dateControlAsString: string;
    name: string;
    conducted: boolean;
    @ConvertValueAPI(numberToStatusTeacherActivity) statusTeacherActivity: StatusTeacherActivity;
    @DateAPI() startDateActivityNumber: Date;
    @DateAPI() endDateActivityNumber: Date;
    hideEduDate: boolean; // Deprecated
    @DateAPI() dateControlNumber: Date;
    classroom: string;
    territory: string;
    commentToTeacherFromManager: string;
    commentToTeacherContext: string;
    teacherActivity: string;
    providingEducation: string;
    webAddress: string;
    @ObjectAPI(EduResources) resources: EduResources;
    availableForumCategory: boolean;
    mustCheckEducation: boolean;
    countTasks: number;
    @ObjectAPI(EduScaleMarks) scaleMarks: EduScaleMarks;
    electronicEducation: boolean;
    @ObjectAPI(EduTemplate) eduTemplate: EduTemplate;
    availableUsersFileUpload: boolean;
    autoComplete: boolean;
    image: string;
    @ConvertValueAPI(convertSpentTimeDisplayOptions) timeDisplayOption: SpentTimeDisplayOptions;
    @ObjectAPI(ActivityPluginService) pluginService: ActivityPluginService; // Добавлено в 3.0.15
    // ДОБАВЛЕНО:
    get status(): StatusTeacherActivity {
        if (this.statusTeacherActivity) {
            return this.statusTeacherActivity;
        }
        // Для совместимости с КУ, в которой нет свойства statusTeacherActivity:
        return (this.conducted) ? statusesTeacherActivity.FINISHED : statusesTeacherActivity.IN_PROGRESS;
    }
    get allowFillCheckList(): boolean {
        return (this.status === statusesTeacherActivity.IN_PROGRESS
            || this.status === statusesTeacherActivity.SCHEDULED) ? true : false;
    }
    get allowSendAllCommand(): boolean {
        return (this.status === statusesTeacherActivity.IN_PROGRESS
            || this.status === statusesTeacherActivity.SCHEDULED) ? true : false;
    }
    get allowToConductedCommand(): boolean {
        return (this.status === statusesTeacherActivity.IN_PROGRESS) ? true : false;
    }
    get allowFromConductedCommand(): boolean {
        return (this.status === statusesTeacherActivity.FINISHED) ? true : false;
    }
    get displayPeriod(): boolean {
        return !DatesTools.IsEmptyDate(this.startDateActivityNumber)
            || !DatesTools.IsEmptyDate(this.endDateActivityNumber);
    }
    get isResources(): boolean {
        const isResources: boolean = (this.resources) ? this.resources.isResources : false;
        const isEducationRecordings: boolean = (this.pluginService) ? !!this.pluginService.recordingsArray.length : false;
        return isResources || isEducationRecordings;
    }
    imagePath(settings: SettingsService): string {
        if (!this.image) {
            return "";
        }
        return settings.ImageURL(this.image).split("\\").join("/");
    }
    get availableFillMark(): boolean {
        // Преподаватель может выставить оценку если  оценка выставляется и НЕ используются электронные задания.
        return this.mustCheckEducation && !this.electronicEducation && this.status === statusesTeacherActivity.IN_PROGRESS;
    }
    get availableFillComplete(): boolean {
        if (this.statusTeacherActivity === statusesTeacherActivity.SCHEDULED) {
            return false;
        }
        return true;
    }
    get availableFillIncomplete(): boolean {
        if (this.statusTeacherActivity === statusesTeacherActivity.SCHEDULED) {
            return false;
        }
        return true;
    }
    get availableFillAuto(): boolean {
        return this.mustCheckEducation;
    }
    get availableFillNotAdmitted(): boolean {
        return true;
    }
    get availableFillStatus(): boolean {
        return this.availableFillComplete
        || this.availableFillIncomplete
        || this.availableFillAuto
        || this.availableFillNotAdmitted;
    }
    get availableFillComment(): boolean {
        return true;
    }
    get displayGoToCommand(): boolean {
        return !!this.pluginService?.webAddress;
    }
}

export class EduTeacherActivityDescriptionObject {
    @ObjectAPI(EduTeacherActivityDescription) teacherActivity: EduTeacherActivityDescription;
}

export class EduTeacherActivityDescriptionResponse {
    @ObjectAPI(EduTeacherActivityDescriptionObject) response: EduTeacherActivityDescriptionObject;
}

// Ведомость
//

@ArrayElementAPI(EduStudentActivityDescription)
export class EduTeacherActivityCheckListArray extends Array<EduStudentActivityDescription> {

}

export class EduTeacherActivityCheckListObject {
    @ObjectAPI(EduTeacherActivityCheckListArray) userActivity: EduTeacherActivityCheckListArray;
}

export class EduTeacherActivityCheckListResponse {
    @ObjectAPI(EduTeacherActivityCheckListObject) response: EduTeacherActivityCheckListObject;
}

export class EduTeacherUserFile {
    id: string;
    name: string;
    extension: string;
    size: number;
    @DateAPI() timeStamp: Date;
    @ObjectAPI(UserDescription) author: UserDescription;
}

export class EduTeacherUserFilesObject {
    @ObjectAPI(EduTeacherUserFile) file: EduTeacherUserFile;
    @ObjectAPI(UserDescription) user: UserDescription;
    userActivity: string;
}

export class EduTeacherUserFilesDescription {
    checked: boolean;
    @DateAPI() checkedDateNumber: Date;
    id: string;
}

export class EduTeacherUserFilesElement {
    @ObjectAPI(EduTeacherUserFilesObject) object: EduTeacherUserFilesObject;
    @ObjectAPI(EduTeacherUserFilesDescription) userDescription: EduTeacherUserFilesDescription;
}

@ArrayElementAPI(EduTeacherUserFilesElement)
export class EduTeacherActivityCheckListFilesResponse extends Array<EduTeacherUserFilesElement> {

}

// Задания на проверку
//

export class EduTeacherTasksToCheckElement {
    @ObjectAPI(EduStudentTaskAttempt) data: EduStudentTaskAttempt;
    @DateAPI() postponeDate: Date; // Добавлено в версии 3.0.12.87 при реализации панели проверки заданий
}

@ArrayElementAPI(EduTeacherTasksToCheckElement)
export class EduTeacherTasksToCheck extends Array<EduTeacherTasksToCheckElement> {
}

export class EduTeacherTasksRequestParams {
    count?: number;
    providingEducation?: string;
}

export class EduTeacherPostponeTaskAttempt {
    userActivity: string;
    onElectronicResource: boolean;
    taskAttempt: string;
}

export class EduTeacherPostponeRequestParams {
    taskAttempts: EduTeacherPostponeTaskAttempt[];
}

export class EduTeacherSaveMarkData {
    task: string;
    mark: string;
    reasonToRevision: string;
    comment: string;
}

export class EduTeacherSaveMarkRequest extends Array<EduTeacherSaveMarkData> {
}

export class EduTeacherSaveMarkResult extends EduTeacherSaveMarkData {
    @ObjectAPI(SaveTaskActionResult) taskActionResult: SaveTaskActionResult;
}

@ArrayElementAPI(EduTeacherSaveMarkResult)
export class EduTeacherSaveMarkResults extends Array<EduTeacherSaveMarkResult> {

}

export class EduTeacherSaveMarkResponse {
    operationComplete: boolean;
    @ObjectAPI(EduTeacherSaveMarkResults) result: EduTeacherSaveMarkResults;
}

@ArrayElementAPI(TeacherUserDescription)
export class EduTeacherActivityTeachers extends Array<TeacherUserDescription> {

}

export type EduTeacherChangeConductMessageCode =
    "needFillTeacherCheckList";

export const eduTeacherChangeConductMessageCodes = {
    needFillTeacherCheckList: "needFillTeacherCheckList" as EduTeacherChangeConductMessageCode,

};

export class EduTeacherChangeConductMessage {
    code: EduTeacherChangeConductMessageCode;
    text: string; // Только на русском (не используется)
}

export class EduTeacherChangeConductResponse {
    operationComplete: boolean;
    @ObjectAPI(EduTeacherChangeConductMessage) message: EduTeacherChangeConductMessage;
}

export class EduTeacherChangePostponeResponse {
    operationComplete: boolean;
}

export class EduTeacherSaveCheckListData {
    id: string;
    mark: string;
    status: number;
    task: string;
    comment: string;
}

export function translateTeacherScorePostfix(translate: TranslateService, score: number): Observable<string> {
    return translate.get([
        'TEACHER_TASKS.SCORE_POSTFIX.SCORE_1',
        'TEACHER_TASKS.SCORE_POSTFIX.SCORE_2',
        'TEACHER_TASKS.SCORE_POSTFIX.SCORE_5',
    ]).pipe(map((labels) => {
        return NumbersTools.declensionNumber(score,
            [
                labels['TEACHER_TASKS.SCORE_POSTFIX.SCORE_1'],
                labels['TEACHER_TASKS.SCORE_POSTFIX.SCORE_2'],
                labels['TEACHER_TASKS.SCORE_POSTFIX.SCORE_5']
            ]);
    }));

}