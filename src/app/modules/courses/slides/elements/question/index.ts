/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {QuestionComponent} from "./question.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MultipleVariantsQuestion} from "./multiple-variants";
import {SequenceVariantsQuestion} from "./sequence-variants";
import {SingleVariantsQuestion} from "./single-variants";
import {MappingVariantsQuestion} from "./mapping-variants";
import {ImageVariantsQuestion} from "./image-variants";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SingleVariantsQuestion,
        SequenceVariantsQuestion,
        MultipleVariantsQuestion,
        MappingVariantsQuestion,
        ImageVariantsQuestion
    ],
    exports: [QuestionComponent],
    declarations: [
        QuestionComponent
    ],
    providers: [
    ]
})

export class Question {

    constructor() {

    }

}