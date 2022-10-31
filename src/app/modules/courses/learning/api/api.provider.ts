import { Injectable } from "@angular/core";
import { APIClassInterface } from "./api.interface";
import { StandardProcessingInterface } from "../../tools/universal/processing";
import { ActivityInterface, LearningInterface } from "../../interface/learning-interface/learning.interface";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { CourseSettingsInterface } from "../../settings/settings.interface";
import { CourseSettingsProvider } from "../../settings/settings.provider";
import { map, takeUntil } from "rxjs/operators";
import { OBJECTS } from "../../tools/universal/objects";
import { V8API } from "./implement/api-v8";
import { LocalAPI } from "./implement/api-local";
import { SCORMAPI } from "./implement/api-scorm";
import { WsAPI } from "./implement/api-ws";
import { Router } from '@angular/router';
import { SettingsService } from '@modules/root/settings/settings.service';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';

declare let courseSettings: CourseSettingsInterface; // global var

@Injectable({
    providedIn: 'root'
})
export class APIProvider implements APIClassInterface {

    public onLoad: Subject<LearningInterface>;
    public onError: Subject<string>;
    private api: APIClassInterface;

    constructor(private http: HttpClient,
        private router: Router,
        private settings: SettingsService,
        private auth: AuthService,
        private err: ErrorsService) {


    }

    public init(ngUnsubscribe: Subject<void>) {

        this.onLoad = new Subject();
        this.onError = new Subject();

        const apiName: string = CourseSettingsProvider.get("api.name");
        switch (apiName) {
            case "v8": {
                this.api = new V8API();
                break;
            }
            case "scorm": {
                this.api = new SCORMAPI();
                break;
            }
            case "ws": {
                this.api = new WsAPI(this.http, this.router, this.settings, this.auth, this.err);
                break;
            }
            default: {
                this.api = new LocalAPI();
                break;
            }
        }

        const dataMap = (data: LearningInterface): LearningInterface => {
            if (!data) {
                return data;
            }
            OBJECTS.iterate(data, (nameProp, valueProp) => { // Получаем из строки объект Дата
                if ((nameProp === 'start' || nameProp === 'end') && typeof valueProp === "string") {
                    return new Date(valueProp);
                } else if (valueProp && typeof valueProp === "object" && typeof valueProp.toDate === "function") {
                    return valueProp.toDate();
                } else {
                    return valueProp;
                }
            });
            return data;
        };

        this.api.onLoad.pipe(takeUntil(ngUnsubscribe)).pipe(map(data => dataMap(data))).subscribe((data) => {
            this.onLoad.next(data);
        });

        this.api.onError.pipe(takeUntil(ngUnsubscribe)).subscribe((error: string) => {
            this.onError.next(error);
        });


    }

    public save(learningData: LearningInterface, activities: Array<ActivityInterface>, isTerminate: boolean, isUnload: boolean) {
        return this.api.save(learningData, activities, isTerminate, isUnload);
    }

    public closeCommandIsAvailable() {
        return this.api.closeCommandIsAvailable();
    }

    public historyCommandsIsAvailable() {
        return this.api.historyCommandsIsAvailable();
    }

    public beforeOpenSlide(uuidSlide: string, standardProcessing: StandardProcessingInterface) {
        return this.api.beforeOpenSlide(uuidSlide, standardProcessing);
    }

    public downloadFile(sURL: string, standardProcessing: StandardProcessingInterface) {
        return this.api.downloadFile(sURL, standardProcessing);
    }

}