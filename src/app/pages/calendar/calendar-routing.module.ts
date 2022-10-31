import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CalendarPageComponent } from './calendar.component';


export const ROUTES: Routes = [
    {
        path: "", component: CalendarPageComponent, children: []
    }
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})

export class CalendarRoutingModule {

    constructor() {

    }

}
