import {
    Component, Input, OnChanges, OnDestroy, OnInit
} from "@angular/core";

import {errorCodes, ErrorInterface} from "./error.interface";

@Component({
    selector: "app-error",
    templateUrl: "app-error.component.html",
    styleUrls: ["app-error.component.scss"]
})

export class AppErrorComponent implements OnInit, OnDestroy, OnChanges {

    @Input() errorData: ErrorInterface;

    errors = errorCodes;

    constructor() {
    }

    ngOnInit() {
    }

    ngOnChanges() {
    }

    ngOnDestroy() {
    }

}

