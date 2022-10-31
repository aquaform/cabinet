import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import { MyPageComponent } from "./my-page.component";


// routes
export const ROUTES: Routes = [
    { path: "**", component: MyPageComponent },
];


@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})

export class MyPageComponentRoutingModule {

    constructor() {

    }

}
