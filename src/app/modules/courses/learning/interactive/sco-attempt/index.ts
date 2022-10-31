/**
 * Created by Baranoshnikov on 24.04.2017.
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {SCOAttemptProvider} from "./sco-attempt.provider";

@NgModule({
    imports: [CommonModule],
    exports: [],
    declarations: [

    ],
    providers: [
        SCOAttemptProvider
    ]
})

export class SCOAttempt {

    constructor() {

    }

}