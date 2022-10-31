/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SequenceVariantsQuestionComponent} from "./sequence-variants.component";
import {SortVariantsByKeyPipe} from "./sequence-variants.pipe";

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    exports: [SequenceVariantsQuestionComponent],
    declarations: [
        SequenceVariantsQuestionComponent,
        SortVariantsByKeyPipe
    ],
    providers: [
    ]
})

export class SequenceVariantsQuestion {

    constructor() {

    }

}