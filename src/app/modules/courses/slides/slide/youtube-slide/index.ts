/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {YouTubeSlideComponent} from "./youtube-slide.component";
import {AppPipes} from "../../../tools/pipes/index";

@NgModule({
    imports: [CommonModule, AppPipes],
    exports: [YouTubeSlideComponent],
    declarations: [
        YouTubeSlideComponent
    ],
    providers: [
    ]
})

export class YouTubeSlide {

    constructor() {

    }

}