import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AppPipes} from "../../../tools/pipes/index";
import {PDFSlideComponent} from "./pdf-slide.component";

@NgModule({
    imports: [CommonModule, AppPipes],
    exports: [PDFSlideComponent],
    declarations: [
        PDFSlideComponent
    ],
    providers: [
    ]
})

export class PDFSlide {

    constructor() {

    }

}