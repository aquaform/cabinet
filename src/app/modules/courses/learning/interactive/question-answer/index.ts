/**
 * Created by Baranoshnikov on 24.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {QuestionAnswerProvider} from "./question-answer.provider";

@NgModule({
    imports: [CommonModule],
    exports: [],
    declarations: [

    ],
    providers: [
        QuestionAnswerProvider
    ]
})

export class QuestionAnswer {

    constructor() {
    }

}