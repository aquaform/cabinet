/**
 * Created by Baranoshnikov on 20.04.2017.
 * Логика изучения курса и прохождения отдельных элементов.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {LearningProvider} from "./learning.provider";
import {Interactive} from "./interactive";
import {API} from "./api";

@NgModule({
    imports: [CommonModule],
    exports: [Interactive, API],
    declarations: [

    ],
    providers: [
        LearningProvider
    ]
})

export class Learning {

    constructor() {

    }

}