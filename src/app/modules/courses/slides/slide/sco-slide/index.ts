/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {SCOSlideComponent} from "./sco-slide.component";
import {AppPipes} from "../../../tools/pipes/index";

@NgModule({
    imports: [CommonModule, AppPipes],
    exports: [SCOSlideComponent],
    declarations: [
        SCOSlideComponent
    ],
    providers: [
    ]
})

export class SCOSlide {

    constructor() {

    }

}