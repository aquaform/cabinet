/**
 * Created by Baranoshnikov on 10.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ImageSlideComponent} from "./image-slide.component";

@NgModule({
    imports: [CommonModule],
    exports: [ImageSlideComponent],
    declarations: [
        ImageSlideComponent
    ],
    providers: [
    ]
})

export class ImageSlide {

    constructor() {

    }

}