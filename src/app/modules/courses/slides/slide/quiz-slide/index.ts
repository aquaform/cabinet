/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {QuizSlideComponent} from "./quiz-slide.component";
import {Question} from "../../elements/question";
import {AppPipes} from "../../../tools/pipes/index";

@NgModule({
    imports: [CommonModule, Question, AppPipes],
    exports: [QuizSlideComponent],
    declarations: [
        QuizSlideComponent,
    ],
    providers: [
    ]
})

export class QuizSlide {

    constructor() {

    }

}

