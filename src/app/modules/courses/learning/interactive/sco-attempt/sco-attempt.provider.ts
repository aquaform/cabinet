/**
 * Created by Baranoshnikov on 24.04.2017.
 * Реализует логику тестирования и подписки на события тестирования.
 */

import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {SCOAttemptInterface} from "../../../interface/learning-interface/sco/sco-attempt.interface";

@Injectable({
    providedIn: 'root'
})
export class SCOAttemptProvider {

    onInitialize: Subject<SCOAttemptInterface>;
    onCommit: Subject<SCOAttemptInterface>;
    onTerminate: Subject<SCOAttemptInterface>;
    onClose: Subject<void>;

    constructor() {

    }

    init(ngUnsubscribe: Subject<void>) {
        this.onInitialize = new Subject();
        this.onCommit = new Subject();
        this.onTerminate = new Subject();
        this.onClose = new Subject();
    }

}