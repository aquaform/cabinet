/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SingleVariantsQuestionComponent} from "./single-variants.component";

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    exports: [SingleVariantsQuestionComponent],
    declarations: [
        SingleVariantsQuestionComponent
    ],
    providers: [
    ]
})

export class SingleVariantsQuestion {

    constructor() {

    }

}