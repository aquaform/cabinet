import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import { LibraryComponent } from './library.component';


// routes
export const ROUTES: Routes = [
    { path: "folder/:folder", component: LibraryComponent },
    { path: ":block", component: LibraryComponent },
    { path: "**", component: LibraryComponent },
];


@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})

export class LibraryRoutingModule {

    constructor() {

    }

}
