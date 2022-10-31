/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {HTMLSlideComponent} from "./html-slide.component";
import {AppPipes} from "../../../tools/pipes/index";

@NgModule({
    imports: [CommonModule, AppPipes],
    exports: [HTMLSlideComponent],
    declarations: [
        HTMLSlideComponent
    ],
    providers: [
    ]
})

export class HTMLSlide {

    constructor() {

    }

}