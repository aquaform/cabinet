import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ModalComponent} from "./modal.component";
import {Slide} from "../slides/slide/slide.module";
import {Term} from "../slides/elements/term";
import {AppError} from "../error/index";
import { TranslateModule } from "@ngx-translate/core";
import { IconModule } from "@modules/root/icon/icon.module";

@NgModule({
    imports: [CommonModule, Slide, Term, AppError, TranslateModule, IconModule],
    exports: [ModalComponent],
    declarations: [
        ModalComponent
    ]
})

export class CourseModal {

    constructor() {

    }

}