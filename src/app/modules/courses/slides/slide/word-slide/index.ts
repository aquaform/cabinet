/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {WordSlideComponent} from "./word-slide.component";
import {AppPipes} from "../../../tools/pipes/index";

@NgModule({
    imports: [CommonModule, AppPipes],
    exports: [WordSlideComponent],
    declarations: [
        WordSlideComponent
    ],
    providers: [
    ]
})

export class WordSlide {

    constructor() {

    }

}