import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { StartComponent } from './start.component';


// routes
export const ROUTES: Routes = [
    { path: "", component: StartComponent },
    { path: ":block", component: StartComponent },
    { path: "**", component: StartComponent }
];


@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})

export class StartRoutingModule {

    constructor() {

    }

}
