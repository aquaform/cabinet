/**
 * Created by Baranoshnikov on 12.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {SlideComponent} from "./slide.component";
import {TextSlide} from "./text-slide";
import {SlideProvider} from "./slide.provider";
import {VideoSlide} from "./video-slide";
import {QuizSlide} from "./quiz-slide";
import {StartSlide} from "./start-slide/start-slide.module";
import {WordSlide} from "./word-slide";
import {CollectionSlide} from "./collection-slide";
import {FinalSlide} from "./final-slide";
import {AudioSlide} from "./audio-slide";
import {ImageSlide} from "./image-slide";
import {YouTubeSlide} from "./youtube-slide";
import {SCOSlide} from "./sco-slide";
import {HTMLSlide} from "./html-slide";
import {PDFSlide} from "./pdf-slide";
import {ArchiveSlide} from "./archive-slide";
import {GlossarySlide} from "./glossary-slide";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        TextSlide,
        VideoSlide,
        AudioSlide,
        QuizSlide,
        StartSlide,
        WordSlide,
        CollectionSlide,
        FinalSlide,
        ImageSlide,
        YouTubeSlide,
        SCOSlide,
        HTMLSlide,
        PDFSlide,
        ArchiveSlide,
        GlossarySlide,
        TranslateModule,
    ],
    exports: [
        SlideComponent
    ],
    declarations: [
        SlideComponent
    ],
    providers: [
        SlideProvider
    ]
})

export class Slide {

    constructor() {

    }

}