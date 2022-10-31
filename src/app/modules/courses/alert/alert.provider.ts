import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {AlertInterface} from "./alert.interface";

@Injectable({
    providedIn: 'root'
})
export class AlertProvider {

    onChange: Subject<AlertInterface>;

    constructor() {}

    init(ngUnsubscribe: Subject<void>) {
        this.onChange = new Subject();
    }

}