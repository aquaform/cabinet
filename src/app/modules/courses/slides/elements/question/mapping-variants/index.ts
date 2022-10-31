import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MappingVariantsQuestionComponent} from "./mapping-variants.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [MappingVariantsQuestionComponent],
    declarations: [
        MappingVariantsQuestionComponent
    ],
    providers: [
    ]
})

export class MappingVariantsQuestion {

    constructor() {

    }

}