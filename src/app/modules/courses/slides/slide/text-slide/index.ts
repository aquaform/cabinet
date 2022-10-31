/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TextSlideComponent} from "./text-slide.component";

@NgModule({
    imports: [CommonModule],
    exports: [TextSlideComponent],
    declarations: [
        TextSlideComponent
    ],
    providers: [
    ]
})

export class TextSlide {

    constructor() {

    }

}