/**
 * Created by Baranoshnikov on 24.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {Question} from "./question";
import {Term} from "./term";

@NgModule({
    imports: [CommonModule],
    exports: [Question, Term],
    declarations: [
    ],
    providers: [
    ]
})

export class Elements {

    constructor() {

    }

}