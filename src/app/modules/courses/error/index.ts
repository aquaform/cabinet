import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AppErrorComponent} from "./app-error.component";
import {ErrorProvider} from "./error.provider";

@NgModule({
    imports: [
        CommonModule,
    ],
    exports: [
        AppErrorComponent
    ],
    declarations: [
        AppErrorComponent
    ],
    providers: [
        ErrorProvider
    ]
})

export class AppError {

    constructor() {

    }

}