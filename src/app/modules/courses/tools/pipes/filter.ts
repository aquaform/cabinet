import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'filter',
    pure: false
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], callback: (item: any, params: any) => boolean, params?: any): any {
        if (!items || !callback) {
            return items;
        }
        return items.filter(item => callback(item, params));
    }
}