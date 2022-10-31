import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { SCOSlideDataInterface } from "../../../interface/data-interface/course-data.interface";
import { SCOAttemptProvider } from "../../../learning/interactive/sco-attempt/sco-attempt.provider";
import { API148411 } from "../../../learning/interactive/sco-attempt/API_1484_11";
import { LearningProvider } from "../../../learning/learning.provider";
import { CourseDataProvider } from "../../../data/course-data.provider";
import { BROWSER } from "../../../tools/universal/browser";
import { LOCATION } from "../../../tools/universal/location";
import { takeUntil } from "rxjs/operators";
import { AppComponentTemplate } from "@shared/component.template";
import { SCOAttemptInterface } from "@modules/courses/interface/learning-interface/sco/sco-attempt.interface";

@Component({
    selector: "sco-slide",
    templateUrl: "sco-slide.component.html",
    styleUrls: ["sco-slide.component.scss"]
})

export class SCOSlideComponent extends AppComponentTemplate implements OnInit, OnDestroy {

    @Input() slide: SCOSlideDataInterface; // Слайд

    url: string;
    oldWebkit: boolean;

    constructor(private sco: SCOAttemptProvider, private lp: LearningProvider) {
        super();
        this.oldWebkit = BROWSER.oldWebkit();
    }

    ngOnInit() {

        // Создаем глобальный объект API_1484_11, к которому
        // будет подключаться SCO.
        window["API_1484_11"] = new API148411(this.sco, this.slide, this.lp);

        // Получаем url SCO

        this.url = CourseDataProvider.dataFolderPath() + this.slide.sco.path;
        const params = this.slide.sco.parameters;
        if (params) {
            this.url += "?" + params;
        }
        if (this.oldWebkit) {
            // параметр rnd для старых Webkit
            this.url += (params) ? "&" : "?";
            this.url += "rnd4002580234=" + LOCATION.rndAdd();
        }

        this.sco.onClose
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                // Данная реализация через клик на кнопку сделана для
                // обхода ошибки angular при которой не происходит
                // уничтожения компоненты, даже после перехода на другой роутинг.
                // Можно смоделировать, вызвав метод closeCourse напрямую здесь.
                setTimeout(() => {
                    const hideSCORMCloseButton = document.getElementById("hideSCORMCloseButton");
                    if (hideSCORMCloseButton) {
                        hideSCORMCloseButton.click();
                    }
                }, 100);
            });

    }

    ngOnDestroy() {
        window["API_1484_11"] = undefined;
    }

    closeCourse() {
        this.lp.close();
    }

}

