import {Injectable} from "@angular/core";
import { Subject } from "rxjs";
import { modalTypes } from "../modal/modal.interface";
import {ModalProvider} from "../modal/modal.provider";
import {ErrorInterface} from "./error.interface";

@Injectable({
    providedIn: 'root'
})
export class ErrorProvider {

    constructor(private mp: ModalProvider) {
    }

    init(ngUnsubscribe: Subject<void>) {

    }

    err(data: ErrorInterface): void {
        if ("console" in data && data.console) {
            console.error(data.console);
        }
        if ("code" in data && data.code) {
            this.mp.open({
                type: modalTypes.ERROR,
                error: data
            });
        }
    }

}