import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ForumComponent } from './forum.component';


export const ROUTES: Routes = [
    { path: "topic/:topic", component: ForumComponent },
    { path: "**", component: ForumComponent }
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})

export class ForumRoutingModule {

    constructor() {

    }

}
