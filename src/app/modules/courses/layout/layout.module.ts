import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {LayoutComponent} from "./layout.component";
import {CourseModal} from "../modal/modal.module";
import { SingleLayoutComponent } from "./single-layout/single-layout.component";
import { SlidesLayoutComponent } from "./slides-layout/slides-layout.component";
import { TocLayoutComponent } from "./toc-layout/toc-layout.component";
import { SplitComponent } from "./toc-layout/split/split.component";
import { AlertCourse } from "../alert/alert.module";
import { Slides } from "../slides";
import { NavCourse } from "../nav/nav.module";

@NgModule({
    imports: [CommonModule, RouterModule, CourseModal, AlertCourse, Slides, NavCourse],
    exports: [LayoutComponent],
    declarations: [
        LayoutComponent,
        SingleLayoutComponent,
        SlidesLayoutComponent,
        TocLayoutComponent,
        SplitComponent
    ]
})

export class Layout {

    constructor() {

    }


}