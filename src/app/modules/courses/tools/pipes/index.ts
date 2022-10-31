/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {SafeURLPipe} from "./safe-url.pipe";
import {DeclensionPipe} from "./declension.pipe";
import {MinutesPipe, TimePipe} from "./time.pipe";
import {FilterPipe} from "./filter";

@NgModule({
    imports: [CommonModule],
    exports: [SafeURLPipe, DeclensionPipe, TimePipe, MinutesPipe, FilterPipe],
    declarations: [
        SafeURLPipe, DeclensionPipe, TimePipe, MinutesPipe, FilterPipe
    ],
    providers: [
    ]
})

export class AppPipes {

    constructor() {

    }

}