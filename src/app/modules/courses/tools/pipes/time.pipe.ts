/**
 * Created by Baranoshnikov on 28.05.2017.
 */

import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'time'})
export class TimePipe implements PipeTransform {
    transform(time: number, param?: string): string {

        // Hours, minutes and seconds
        let hrs = ~~(time / 3600);
        let mins = ~~((time % 3600) / 60);
        let secs = time % 60;

        // Output like "1:01" or "4:03:59" or "123:03:59"
        let ret = "";

        if (hrs > 0) {
            ret += "" + hrs + ":";
        }

        ret += "" + (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;

    }
}

@Pipe({name: 'minutes'})
export class MinutesPipe implements PipeTransform {
    transform(seconds: number, param?: string[]): number {

        return seconds / 60;

    }
}