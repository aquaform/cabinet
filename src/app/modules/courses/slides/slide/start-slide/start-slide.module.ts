import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {StartSlideComponent} from "./start-slide.component";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [CommonModule, TranslateModule],
    exports: [StartSlideComponent],
    declarations: [
        StartSlideComponent
    ]
})

export class StartSlide {

    constructor() {

    }

}