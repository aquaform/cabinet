/**
 * Created by Baranoshnikov on 24.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {QuizDataProvider} from "./quiz-data.provider";

@NgModule({
    imports: [CommonModule],
    exports: [],
    declarations: [

    ],
    providers: [
        QuizDataProvider
    ]
})

export class QuizData {

    constructor() {

    }

}