/**
 * Created by Baranoshnikov on 11.05.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {Question} from "../../elements/question";
import {CollectionSlideComponent} from "./collection-slide.component";
import {AppPipes} from "../../../tools/pipes/index";
import { PDFSlide } from '../pdf-slide';
import { VideoSlide } from '../video-slide';
import { AudioSlide } from '../audio-slide';

@NgModule({
    imports: [CommonModule, Question, AppPipes, PDFSlide, VideoSlide, AudioSlide],
    exports: [CollectionSlideComponent],
    declarations: [
        CollectionSlideComponent
    ],
    providers: [
    ]
})

export class CollectionSlide {

    constructor() {

    }

}