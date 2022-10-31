import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { slideRoutes } from '@modules/courses/slides/slides.routes';
import { CoursePageComponent } from './course.component';

export const ROUTES: Routes = [
    {path: "", component: CoursePageComponent, children: slideRoutes},
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})

export class CourseRoutingModule {

    constructor() {

    }

}
