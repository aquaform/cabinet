import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {SearchProvider} from "./search.provider";

@NgModule({
    imports: [CommonModule],
    exports: [],
    declarations: [],
    providers: [
        SearchProvider
    ]
})

export class Search {

    constructor() {

    }

}