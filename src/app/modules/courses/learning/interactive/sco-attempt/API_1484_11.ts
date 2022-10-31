import {SCOAttemptProvider} from "./sco-attempt.provider";
import {SCOAttemptInterface} from "../../../interface/learning-interface/sco/sco-attempt.interface";
import {SCOSlideDataInterface} from "../../../interface/data-interface/course-data.interface";
import {LearningProvider} from "../../learning.provider";
import {UUID} from "../../../tools/universal/uuid";
import { environment } from '@environments/environment';

export class API148411 {

    public version: string = "1.0";
    public lastError: string;
    public errorString: string;

    public attempt: SCOAttemptInterface; // Класс управляет свойствами попытки SCORM

    constructor(private sp: SCOAttemptProvider, private slide: SCOSlideDataInterface, private lp: LearningProvider) {
        this.clearError();
    }

    public Initialize(nameValue: string): string {

        if (environment.displayLog) {
            console.log("Initialize");
        }

        this.clearError();

        if (nameValue) {
            this.lastError = "201";
            return "false";
        }


        let SCOActivity: SCOAttemptInterface; // Попытка SCORM

        let activity = this.lp.learning.activities.find((activity) => activity.slide === this.slide.uuid); // Общая активость обучения для этого слайда
        if (activity) {
            // Ищем попытку SCORM со статусом suspend и восстанавливаем ее.
            // Эта попытка может быть завершена, но если SCO установила suspend,
            // то надо ее ей вернуть и не начинать новую попытку.
            // SCOActivity = activity.scoAttempts.find((scoActivity) => scoActivity.cmi.exit === 'suspend');
            // но по факту не делаем это из-за того, что в SCORM ЭО 3.0 есть ошибка с тем, что
            // cmi.exit устанавливается неправильно. Есть вероятность, что такое может быть и в других
            // курсах SCORM. Поэтому лучшим решением, пока считаем всегда восстанавливать последнюю
            // попытку SCORM, при любом статусе.
            if (activity.scoAttempts.length) {
                SCOActivity = activity.scoAttempts[activity.scoAttempts.length - 1];
            }
        }

        if (SCOActivity) {

            SCOActivity.cmi.entry = "resume";

        } else {

            SCOActivity = {
                uuid: UUID.get(),
                slide: this.slide.uuid,
                complete: false,
                progress: 0,
                start: new Date(),
                end: null,
                score: 0,
                cmi: {
                    _version: "1.0",
                    comments_from_learner: {
                        _children: "comment,location,timestamp",
                        _count: 0
                    },
                    comments_from_lms: {
                        _children: "comment,location,timestamp",
                        _count: 0
                    },
                    completion_status: "",
                    completion_threshold: this.slide.sco.completionThreshold,
                    credit: "credit",
                    entry: "ab-initio",
                    exit: "",
                    interactions: {
                        _children: "id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description",
                        _count: 0
                    },
                    launch_data: this.slide.sco.dataFromLMS,
                    learner_id: "",
                    learner_name: "",
                    learner_preference: {
                        _children: "audio_level, language, delivery_speed, audio_captioning",
                        audio_level: "",
                        language: "",
                        delivery_speed: "",
                        audio_captioning: ""
                    },
                    location: "",
                    max_time_allowed: this.slide.sco.limitConditions,
                    mode: "normal",
                    objectives: {
                        _children: "id,score,success_status,completion_status,progress_measure,description",
                        _count: 0
                    },
                    progress_measure: "",
                    scaled_passing_score: "1.0",
                    score: {
                        "_children": "scaled,min,max,raw",
                        "scaled": "",
                        "min": "",
                        "max": "",
                        "raw": "",
                    },
                    session_time: "",
                    success_status: "",
                    suspend_data: "",
                    time_limit_action: this.slide.sco.timeLimitAction,
                    total_time: "" // TODO: Не тестировалось
                },
                adl: {
                    data: {
                        _children: "id, store",
                        _count: 0
                    }
                }
            };

        }

        this.sp.onInitialize.next(SCOActivity);

        this.attempt = SCOActivity;

        return "true";
    }

    public Terminate(nameValue: string): string {

        if (environment.displayLog) {
            console.log("Terminate");
        }

        this.clearError();

        if (!this.attempt) {
            this.lastError = "112";
            return "false";
        }

        if (nameValue) {
            this.lastError = "201";
            return "false";
        }

        this.updateSCOActivity();
        this.sp.onTerminate.next(this.attempt);

        return "true";

    }

    public GetValue(nameValue: string): string {

        if (environment.displayLog) {
            console.log("GetValue: " + nameValue);
        }

        this.clearError();

        if (!this.attempt) {
            this.lastError = "122";
            this.errorString = "Сессия не инициализирована (122)";
            return "";
        }

        if (!nameValue) {
            this.lastError   = "301";
            this.errorString = "Не задано имя получаемого значения (301)";
            return "";
        }

        // Заменяем последнее свойство

        let value = API148411.resolve(nameValue, this.attempt);
        value = (value) ? String(value) : "";
        return value;

    }

    public SetValue(nameValue: string, value: string): string {

        if (environment.displayLog) {
            console.log("SetValue: " + nameValue + "=" + value);
        }

        this.clearError();

        if (!this.attempt) {
            this.lastError = "132";
            this.errorString = "Сессия не инициализирована (132)";
            return "false";
        }

        if (!nameValue) {
            this.lastError   = "351";
            this.errorString = "Не задано имя устанавливаемого значения (351)";
            return "false";
        }

        let nameArray = nameValue.split(".");

        let curObject;

        if (nameArray[0] === "cmi") {

            curObject = this.attempt.cmi;

        } else if (nameArray[0] === "adl") {

            curObject = this.attempt.adl;

        } else {

            this.lastError = "101";
            this.errorString = "Неверный формат запроса на сохранение данных.";
            return "false";
        }

        for (let num = 1; num < nameArray.length; num++) {
            // Добавляем новые свойства
            if (!(nameArray[num] in curObject)) {
                curObject[nameArray[num]] = {};
            }
            // Присваиваем значение
            if (num === nameArray.length - 1) {
                curObject[nameArray[num]] = value;

            }
            // Считаем количество элементов
            if ("_count" in curObject) {
                let count = 0;
                for (let prop in curObject) {
                    if (curObject.hasOwnProperty(prop) && prop !== '_count' && prop !== '_children') {
                        ++count;
                    }
                }
                curObject._count = count;
            }
            // Завершаем
            curObject = curObject[nameArray[num]];
        }


        return "true";
    }

    public Commit(nameValue: string): string {

        if (environment.displayLog) {
            console.log("Commit");
        }

        this.clearError();

        if (!this.attempt) {
            this.lastError = "112";
            return "false";
        }

        if (nameValue) {
            this.lastError = "201";
            return "false";
        }

        this.updateSCOActivity();
        this.sp.onCommit.next(this.attempt);

        return "true";
    }

    public GetLastError(): string {
        return this.lastError;
    }

    public GetErrorString(): string {
        return this.errorString;
    }

    public GetDiagnostic(): string {
        return this.errorString + "(" + this.lastError + ")";
    }

    /////////////////////////////////////////////////////////

    private clearError() {
        this.errorString = "";
        this.lastError = "0";
    }

    // Получает свойство объекта
    // Пример: resolve("style.width", document.body)
    //
    private static resolve(path, obj) {
        return path.split('.').reduce(function(prev, curr) {
            return prev ? prev[curr] : null;
        }, obj || self);
    }

    private updateSCOActivity() {

        // Фиксируем завершенность

        if (this.attempt.cmi.completion_status === "completed") {
            this.attempt.complete = true;
            this.attempt.end = new Date();
        }

        // Фиксируем прогресс

        this.attempt.progress = Number(this.attempt.cmi.progress_measure) * 100;

        // Фиксируем оценку

        if (this.attempt.cmi.score.scaled) {
            this.attempt.score = Number(this.attempt.cmi.score.scaled) * 100;
        } else {
            if (Number(this.attempt.cmi.score.max) + Number(this.attempt.cmi.score.min) > 0) {
                this.attempt.score = Math.round((Number(this.attempt.cmi.score.raw) / (Number(this.attempt.cmi.score.max) + Number(this.attempt.cmi.score.min))) * 100);
            } else {
                this.attempt.score = 0;
            }
        }
        if (this.attempt.score < 0) {
            this.attempt.score = 0;
        }
        if (this.attempt.score > 100) {
            this.attempt.score = 100;
        }

    }


}

