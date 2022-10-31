import { Subject, throwError, Observable } from "rxjs";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ErrorsService } from '@modules/root/errors/errors.service';

@Component({
    template: ''
})
export class AppComponentTemplate implements OnInit, OnDestroy {

    protected readonly ngUnsubscribe: Subject<void> = new Subject<void>();

    protected constructor() {
        // Класс можно только наследовать
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    catchError(errorService: ErrorsService): (err: any) => Observable<never> {
        return (err: any) => {
            errorService.register(err);
            return throwError(err);
        };
    }

}
