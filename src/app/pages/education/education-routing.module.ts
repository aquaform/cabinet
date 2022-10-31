import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EducationComponent } from './education.component';
import { ActivityComponent } from './activity/activity.component';
import { ActivitiesComponent } from './activities/activities.component';
import { TaskComponent } from './task/task.component';


export const ROUTES: Routes = [
    {
        path: "", component: EducationComponent, children: [
            { path: "activity/:activity/:block", component: ActivityComponent },
            { path: "activity/:activity", component: ActivityComponent },
            { path: "activity/:activity/task/:task", component: TaskComponent },
            { path: ":block", component: ActivitiesComponent },
            { path: "**", component: ActivitiesComponent },
        ]
    }
];


@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})

export class EducationRoutingModule {

    constructor() {

    }

}
