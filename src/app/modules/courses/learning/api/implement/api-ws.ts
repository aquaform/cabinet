import { APIClassInterface } from "../api.interface";
import { ActivityInterface, LearningInterface } from "../../../interface/learning-interface/learning.interface";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { StandardProcessingInterface } from "../../../tools/universal/processing";
import { COOKIE } from "../../../tools/universal/cookie";
import { CourseDataProvider } from '@modules/courses/data/course-data.provider';
import { CourseSettingsInterface } from '@modules/courses/settings/settings.interface';
import { CourseAPISettings } from '@modules/resources/res/res.interface';
import { Router } from '@angular/router';
import { SettingsPortalInterface, SettingsResInterface } from '@modules/root/settings/settings.interface';
import { environment } from '@environments/environment';
import { SettingsService } from '@modules/root/settings/settings.service';
import { APIServiceNames } from '@modules/root/api/api.interface';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { CourseDataInterface } from '@modules/courses/interface/data-interface/course-data.interface';

declare let onBeforeUnloadText: string; // global var
declare let oSettingsRes: SettingsResInterface; // global var
declare let oSettingsPortal: SettingsPortalInterface;  // global var
declare let courseSettings: CourseSettingsInterface; // global var
declare let courseAPISettings: CourseAPISettings; // global var
declare let courseData: CourseDataInterface; // Данные курсы видны глобально

interface ActivitiesCommitData {
    index: number;
    uuid: string; // Идентификатор активности
    commitDate: number; // Дата, когда активность была сохранена последний раз
    actualDate: number; // Дата изменения активности
}

export class WsAPI implements APIClassInterface {

    public onLoad: Subject<LearningInterface> = new Subject();
    public onError: Subject<string> = new Subject();

    private actualLearningDate: number; // Дата, на которую данные актуальны (новые данные)
    private actualLearningData: LearningInterface; // Актуальные на сейчас данные для сохранения

    private isCommit: boolean; // Признак того, что идет запись данных сейчас
    private activitiesCommitData: Array<ActivitiesCommitData> = []; // Массив описаний активностей, которые записывались в базу
    private propertiesCommitData: any = {}; // Простые свойства, которые записывались в базу
    private commitDate: number; // Последняя дата сохраненных данных
    private isTerminate = false;
    private countCommitErrors = 0;
    private isUnload = false;

    private session: string;

    constructor(
        private http: HttpClient,
        private router: Router,
        private settings: SettingsService,
        private auth: AuthService,
        private err: ErrorsService) {

        if (!oSettingsRes || !oSettingsPortal) {
            this.registerError("learning-api-get");
            return;
        }

        this.session = COOKIE.get(oSettingsPortal.storageName('session'));

        if (!this.session) {
            this.registerError("learning-api-session-empty");
            return;
        }

        const url: string = this.settings.ServiceURL(APIServiceNames.res) + "/learning/get" + this.auth.SearchParams();

        const commitData = {
            context: courseAPISettings
        };

        this.http.post(url, commitData)
            .subscribe((loadedData: any) => {

                if (environment.displayLog) {
                    console.log("Course learning data from db:", loadedData);
                }

                if (loadedData && (typeof loadedData === 'object')) {

                    let currentLearningData: any;

                    if ('uuid' in loadedData) {
                        const data = {
                            activities: []
                        };
                        for (const property in loadedData) {
                            if (!loadedData.hasOwnProperty(property)) {
                                continue;
                            }
                            if (property.substr(0, "activity_".length) === 'activity_') {
                                data.activities[Number(property.substr("activity_".length))] = loadedData[property];
                            } else {
                                data[property] = loadedData[property];
                            }

                        }
                        currentLearningData = Object.assign({}, data);
                    }

                    this.onLoad.next(currentLearningData);

                } else {

                    this.registerError("learning-api-get");

                }

            }, (error) => {
                this.registerError("learning-api-get", error);
            });

    }


    save(currentLearningData: LearningInterface, activities: Array<ActivityInterface>, isTerminate: boolean, isUnload: boolean) {

        this.actualLearningDate = Date.now(); // Запоминаем дату, на которую актуальны данные обучения
        this.actualLearningData = currentLearningData; // Помещаем все данные в переменную

        if (isTerminate) {
            this.isTerminate = true;
        }

        if (isUnload) {
            this.isUnload = true;
        }

        // Помещаем описание активности в массив activitiesCommitData

        for (const activity of activities) {

            let activityCommitData: ActivitiesCommitData; // Ищем ранее помещенное описание
            activityCommitData = this.activitiesCommitData.find(
                (curActivityCommitData) => curActivityCommitData.uuid === activity.uuid
            );

            if (!activityCommitData) { // Не нашли, поэтому создаем новое описание
                const activityCommitDataIndex = currentLearningData.activities.findIndex(
                    (curActivityCommitData) => curActivityCommitData.uuid === activity.uuid);
                activityCommitData = {
                    index: activityCommitDataIndex,
                    uuid: activity.uuid,
                    actualDate: 0,
                    commitDate: 0
                };
                this.activitiesCommitData.push(activityCommitData);
            }

            // Обновляем дату актуальности данных активности

            activityCommitData.actualDate = this.actualLearningDate;

        }

        // Выполняем запись данных, если сейчас не идет запись

        if (!this.isCommit) {
            this.commit();
        }

    }

    closeCommandIsAvailable() {
        return true;
    }

    historyCommandsIsAvailable() {
        return false;
    }

    beforeOpenSlide(uuidSlide: string, standardProcessing: StandardProcessingInterface) {
    }

    downloadFile(sURL: string, standardProcessing: StandardProcessingInterface) {
    }


    private commit() {

        onBeforeUnloadText = ''; // Будет стандартное сообщение браузера, если пользователь закроет страницу во время записи
        this.isCommit = true; // Сообщаем, что идет запись

        // Формируем данные для сохранения
        //

        const commitData = {};

        // Простые свойства

        for (const property in this.actualLearningData) {
            if (!this.actualLearningData.hasOwnProperty(property)) {
                continue;
            }
            if (property === "activities") {
                continue;
            }
            if (this.propertiesCommitData && property in this.propertiesCommitData
                && this.propertiesCommitData[property] === this.actualLearningData[property]) {
                continue; // Свойство с этим значением уже записывалось (его не пишем)
            }
            commitData[property] = this.actualLearningData[property];
            this.propertiesCommitData[property] = this.actualLearningData[property];
        }

        // Активности

        const activitiesToCommit = [];

        for (const activityCommitData of this.activitiesCommitData) {
            if (activityCommitData.actualDate >= activityCommitData.commitDate) {
                commitData["activity_" + String(activityCommitData.index)] = this.actualLearningData.activities.find(
                    (curActivity) => curActivity.uuid === activityCommitData.uuid
                );
                activitiesToCommit.push(activityCommitData);
            }
        }

        // Контекст

        if (this.isTerminate) {
            courseAPISettings.isTerminate = true;
        }

        if (this.isUnload) {
            courseAPISettings.isUnload = true;
        }

        courseAPISettings.learningActivity = this.actualLearningData.uuid;
        courseAPISettings.checkSum = courseData.checkSum;

        commitData["context"] = courseAPISettings;

        // Запоминаем дату записи и активностей по отдельности

        this.commitDate = Date.now();

        for (const committedActivity of activitiesToCommit) {
            if (committedActivity.commitDate < this.commitDate) {
                committedActivity.commitDate = this.commitDate;
            }
        }

        // Сохраняем данные
        //

        const url: string = this.settings.ServiceURL(APIServiceNames.res) + "/learning/commit" + this.auth.SearchParams();

        if (environment.displayLog) {
            console.log("Course learning data to save:", commitData);
        }

        if (this.isUnload) {
            navigator.sendBeacon(url, JSON.stringify(commitData));
        } else {
            this.http.post(url, commitData).subscribe(
                () => this.afterPut(),
                (error) => {
                    this.countCommitErrors++;
                    this.afterPut();
                });
        }

    }

    private afterPut() {

        if (this.countCommitErrors > 25) {
            alert("Probably the course data will not be saved correct. Please contact to the administration.");
            this.countCommitErrors = 0;
            return;
        }

        if (this.actualLearningDate > this.commitDate) {
            // Если данные устарели за время записи, то пишем снова
            this.commit();
        } else {
            // Прекращаем запись
            this.isCommit = false;
            onBeforeUnloadText = undefined;
            // Закрываем плеер
            if (this.isTerminate) {
                this.navigateFromCourse();
            }
        }
    }

    private navigateFromCourse() {
        const pathToRedirect = courseAPISettings.closePath;
        if (pathToRedirect) {
            this.router.navigate([pathToRedirect]);
        } else {
            location.href = location.origin + location.pathname;
        }

    }

    private registerError(errorName: string, errorData?: any) {
        setTimeout(() => this.onError.next(errorName));
        this.err.register((errorData) ? errorData : errorName);
    }

}