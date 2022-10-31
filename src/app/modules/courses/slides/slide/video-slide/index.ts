/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {VideoSlideComponent} from "./video-slide.component";


@NgModule({
    imports: [CommonModule],
    exports: [VideoSlideComponent],
    declarations: [
        VideoSlideComponent
    ],
    providers: [
    ]
})

export class VideoSlide {

    constructor() {

    }

}