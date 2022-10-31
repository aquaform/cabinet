import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import { TeachingComponent } from './teaching.component';
import { ActivityComponent } from './activity/activity.component';
import { ActivitiesComponent } from './activities/activities.component';
import { TasksComponent } from "./tasks/tasks.component";

export const ROUTES: Routes = [
    {
        path: "", component: TeachingComponent, children: [
            { path: "activity/:activity/:block", component: ActivityComponent },
            { path: "activity/:activity", component: ActivityComponent },
            { path: "tasks/dashboard", component: TasksComponent },
            { path: "tasks/dashboard/providingEducation/:providingEducation", component: TasksComponent },
            { path: "tasks/dashboard/providingEducation/:providingEducation/period/:startPeriod/:endPeriod", component: TasksComponent },
            { path: "tasks/dashboard/providingEducation/:providingEducation/task/:task", component: TasksComponent },
            { path: "tasks/dashboard/task/:task", component: TasksComponent },
            { path: ":block", component: ActivitiesComponent },
            { path: "**", component: ActivitiesComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})

export class TeachingRoutingModule {

    constructor() {

    }

}
