/**
 * Created by Baranoshnikov on 28.05.2017.
 */

import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'declension'})
export class DeclensionPipe implements PipeTransform {
    transform(num: number, titles: string[]): string {
        let cases = [2, 0, 1, 1, 1, 2];
        return String(num) + " " + titles[ (num % 100 > 4 && num % 100 < 20) ? 2 : cases[(num % 10 < 5) ? num % 10 : 5] ];

    }
}
