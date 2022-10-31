/**
 * Created by Baranoshnikov on 29.05.2018.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {GlossarySlideComponent} from "./glossary-slide.component";
import {Term} from "../../elements/term";

@NgModule({
    imports: [CommonModule, Term],
    exports: [GlossarySlideComponent],
    declarations: [
        GlossarySlideComponent
    ],
    providers: [
    ]
})

export class GlossarySlide {

    constructor() {

    }

}