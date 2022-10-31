import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProfileComponent } from './profile.component';

export const ROUTES: Routes = [
    {
        path: "", component: ProfileComponent, children: []
    }
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})

export class ProfileRoutingModule {

    constructor() {

    }

}
