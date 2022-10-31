/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MultipleVariantsQuestionComponent} from "./multiple-variants.component";

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    exports: [MultipleVariantsQuestionComponent],
    declarations: [
        MultipleVariantsQuestionComponent
    ],
    providers: [
    ]
})

export class MultipleVariantsQuestion {

    constructor() {

    }

}