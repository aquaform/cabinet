import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';

import { CoursesComponent } from "./courses.component";
import { Slides } from "./slides";
import { NavCourse } from "./nav/nav.module";
import { Layout } from "./layout/layout.module";
import { Learning } from "./learning";
import { CourseData } from "./data";
import { AlertCourse } from "./alert/alert.module";
import { CourseModal } from "./modal/modal.module";
import { AppError } from "./error";
import { Search } from "./search";
import { RootModule } from '@modules/root/root.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        CoursesComponent,
    ],
    imports: [
        CommonModule,
        Slides,
        NavCourse,
        Layout,
        CourseData,
        Learning,
        AlertCourse,
        CourseModal,
        AppError,
        Search,
        RootModule,
        TranslateModule,
    ],
    exports: [
        CoursesComponent
    ]
})

export class CoursesModule {
}
