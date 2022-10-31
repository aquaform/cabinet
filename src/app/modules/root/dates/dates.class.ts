import { TranslateService } from '@ngx-translate/core';
import { Language } from '../i18n/i18n.class';
import * as dayjs from 'dayjs';

export class DatesTools {

    public static IsDate(date: any): boolean {
        if (!date) {
            return false;
        }
        if (typeof date === "object" && typeof date.getTime === 'function') {
            return true;
        }
        return false;
    }

    public static IsEmptyDate(date: Date): boolean {
        if (!date) {
            return true;
        }
        if (typeof date === "object" && typeof date.getTime === 'function') {
            return !date.getTime();
        }
        return true;
    }

    public static addYears(date: Date, years: number): Date {
        if (DatesTools.IsEmptyDate(date)) {
            return date;
        }
        const currentDate = new Date(date.getTime());
        return dayjs(currentDate).add(years, 'year').toDate();
    }

    public static addMonth(date: Date, months: number): Date {
        if (DatesTools.IsEmptyDate(date)) {
            return date;
        }
        const currentDate = new Date(date.getTime());
        return dayjs(currentDate).add(months, 'month').toDate();
    }

    public static addWeeks(date: Date, weeks: number): Date {
        if (DatesTools.IsEmptyDate(date)) {
            return date;
        }
        const currentDate = new Date(date.getTime());
        return dayjs(currentDate).add(weeks, 'week').toDate();
    }

    public static addDays(date: Date, days: number): Date {
        if (DatesTools.IsEmptyDate(date)) {
            return date;
        }
        const currentDate = new Date(date.getTime());
        return dayjs(currentDate).add(days, 'day').toDate();
    }

    public static addSeconds(date: Date, seconds: number): Date {
        if (DatesTools.IsEmptyDate(date)) {
            return date;
        }
        const currentDate = new Date(date.getTime());
        return dayjs(currentDate).add(seconds, 'second').toDate();
    }

    public static isStartDay(date: Date): boolean {
        const startDay = DatesTools.startDay(date);
        return (startDay.getTime() === date.getTime());
    }

    public static startDay(date: Date): Date {
        if (DatesTools.IsEmptyDate(date)) {
            return date;
        }
        const currentDate = new Date(date.getTime());
        return new Date(currentDate.setHours(0, 0, 0, 0));
    }

    public static startWeek(date: Date): Date {
        if (DatesTools.IsEmptyDate(date)) {
            return date;
        }
        const currentDate = new Date(date.getTime());
        return dayjs(currentDate).startOf('week').toDate();
    }

    public static startMonth(date: Date): Date {
        if (DatesTools.IsEmptyDate(date)) {
            return date;
        }
        const currentDate = new Date(date.getTime());
        return dayjs(currentDate).startOf('month').toDate();
    }

    public static startYear(date: Date): Date {
        if (DatesTools.IsEmptyDate(date)) {
            return date;
        }
        const currentDate = new Date(date.getTime());
        return dayjs(currentDate).startOf('year').toDate();
    }

    public static isEndDay(date: Date): boolean {
        const endDay = DatesTools.endDay(date);
        return (endDay.getTime() === date.getTime());
    }

    public static endDay(date: Date): Date {
        if (DatesTools.IsEmptyDate(date)) {
            return date;
        }
        const currentDate = new Date(date.getTime());
        return new Date(currentDate.setHours(23, 59, 59, 0));
    }

    public static duration(seconds: number, isEduHours?: boolean, getDays?: boolean): { h: number; m: number; d: number } {
        const secondsInHour = (isEduHours) ? 45 * 60 : 60 * 60;
        getDays = (isEduHours) ? false : getDays; // Для академических часов дни не получаем
        const secondsInDay = 60 * 60 * 24;
        const d = (getDays) ? Math.floor(seconds / secondsInDay) : 0;
        const h = Math.floor((seconds - d * secondsInDay) / secondsInHour);
        const m = Math.floor(seconds % secondsInHour / 60);
        return { h: h, m: m, d: d };
    }

    public static dateBySeconds(date: Date): number {
        if (DatesTools.IsEmptyDate(date)) {
            return 0;
        }
        return Math.round(date.getTime() / 1000);
    }

    public static currentDateBySeconds(): number {
        return DatesTools.dateBySeconds(new Date());
    }

    public static sortByDate<T>(
        anyArray: T[],
        getDate: (element: T) => Date,
        reverse: boolean = true,
        emptyToDown = true,
        alwaysToUp?: (element: T) => boolean,
        getName?: (element: T) => string) {

        const sortByName = (element1: T, element2: T): number => {
            if (!getName) {
                return 0;
            }
            return ('' + getName(element1)).localeCompare('' + getName(element2))
        }

        anyArray.sort((element1, element2) => {

            const date1 = getDate(element1);
            const date2 = getDate(element2);

            if (this.IsEmptyDate(date1) && this.IsEmptyDate(date2)) {
                return sortByName(element1, element2);
            }
            if (this.IsEmptyDate(date1)) {
                return (emptyToDown) ? 1 : -1;
            }
            if (this.IsEmptyDate(date2)) {
                return (emptyToDown) ? -1 : 1;
            }
            if (alwaysToUp && alwaysToUp(element1)) {
                return -1;
            }
            if (alwaysToUp && alwaysToUp(element2)) {
                return 1;
            }
            if (date1.getTime() === date2.getTime()) {
                return sortByName(element1, element2);
            }
            if (reverse) {
                return (date1.getTime() < date2.getTime()) ? 1 : -1;
            }
            return (date1.getTime() < date2.getTime()) ? -1 : 1;

        });
    }

    public static timezone(translate: TranslateService): string {

        const language = Language.get(translate);
        const currentDate = new Date();

        if (typeof currentDate.toLocaleDateString !== "function") {
            return "";
        }

        const localeString: string = currentDate.toLocaleDateString(language,
            { year: "numeric", timeZoneName: "long" });

        if (!localeString) {
            return "";
        }

        const localeDate: string[] = localeString.split(",");

        if (localeDate.length > 1) {
            return localeDate[1].trim();
        }

        return "";

    }

}
