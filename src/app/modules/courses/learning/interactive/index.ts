/**
 * Created by Baranoshnikov on 24.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {QuizAttempt} from "./quiz-attempt";
import {QuestionAnswer} from "./question-answer";
import {SCOAttempt} from "./sco-attempt";

@NgModule({
    imports: [CommonModule],
    exports: [QuizAttempt, QuestionAnswer, SCOAttempt],
    declarations: [

    ],
    providers: [

    ]
})

export class Interactive {

    constructor() {

    }

}