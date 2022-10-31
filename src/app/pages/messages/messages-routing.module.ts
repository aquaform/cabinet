import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MessagesComponent } from './messages.component';

export const ROUTES: Routes = [
    { path: ":page/topic/:topic", component: MessagesComponent },
    { path: ":page/topic/:topic", component: MessagesComponent },
    { path: ":page/topic/:topic", component: MessagesComponent },
    { path: "topic/:topic", component: MessagesComponent },
    { path: ":page", component: MessagesComponent },
    { path: "**", component: MessagesComponent }
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})

export class MessagesRoutingModule {

    constructor() {

    }

}
