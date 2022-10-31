import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {SlidesComponent} from "./slides.component";
import {RouterModule} from "@angular/router";
import {Slide} from "./slide/slide.module";
import {Elements} from "./elements";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [CommonModule, RouterModule, TranslateModule],
    exports: [SlidesComponent, Slide, Elements],
    declarations: [
        SlidesComponent
    ],
    providers: [
    ]
})

export class Slides {

    constructor() {

    }

}