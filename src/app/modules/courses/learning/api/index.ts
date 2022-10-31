/**
 * Created by Baranoshnikov on 12.05.2017.
 */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {APIProvider} from "./api.provider";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
    imports: [CommonModule, HttpClientModule],
    exports: [],
    declarations: [

    ],
    providers: [
        APIProvider,
    ]
})

export class API {

    constructor() {

    }

}