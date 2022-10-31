import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AlertComponent} from "./alert.component";
import {AlertProvider} from "./alert.provider";
import {AppPipes} from "../tools/pipes/index";

@NgModule({
    imports: [CommonModule, AppPipes],
    exports: [AlertComponent],
    declarations: [
        AlertComponent
    ],
    providers: [
        AlertProvider
    ]
})

export class AlertCourse {

    constructor() {

    }

}