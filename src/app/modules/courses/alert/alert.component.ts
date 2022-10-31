
import { Component } from "@angular/core";
import { AlertProvider } from "./alert.provider";
import { AlertInterface } from "./alert.interface";
import { AppComponentTemplate } from "@shared/component.template";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "alert",
    templateUrl: "alert.component.html",
    styleUrls: ["alert.component.scss"],
    host: {
        '[style.display]': "(!!data) ? 'block' : 'none'" // Прячем компонент, если нет данных
    }
})

export class AlertComponent extends AppComponentTemplate {

    data: AlertInterface;

    constructor(private ap: AlertProvider) {

        super();

        this.ap.onChange
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.data = data;
            });

    }

}