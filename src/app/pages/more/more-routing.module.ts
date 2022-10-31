import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MoreComponent } from './more.component';

export const ROUTES: Routes = [
    {
        path: "", component: MoreComponent, children: []
    }
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})

export class MoreRoutingModule {

    constructor() {

    }

}
