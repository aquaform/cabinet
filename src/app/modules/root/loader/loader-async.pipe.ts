import { Pipe, PipeTransform } from '@angular/core';
import { isObservable, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';

// From:
// https://medium.com/angular-in-depth/angular-show-loading-indicator-when-obs-async-is-not-yet-resolved-9d8e5497dd8

@Pipe({
    name: 'isLoading',
})
export class WithLoadingPipe implements PipeTransform {
    transform(val: any) {
        return isObservable(val)
            ? val.pipe(
                map((value: any) => ({
                    isLoading: false,
                    value: value
                })),
                startWith({ isLoading: true }),
                catchError(error => of({ isLoading: false, error }))
            )
            : val;
    }
}
