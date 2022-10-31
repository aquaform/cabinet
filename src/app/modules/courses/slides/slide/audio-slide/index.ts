/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AudioSlideComponent} from "./audio-slide.component";

@NgModule({
    imports: [CommonModule],
    exports: [AudioSlideComponent],
    declarations: [
        AudioSlideComponent
    ],
    providers: [
    ]
})

export class AudioSlide {

    constructor() {

    }

}