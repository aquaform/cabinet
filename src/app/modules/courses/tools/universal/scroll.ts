import {ElementRef} from "@angular/core";

export class Scroll {

    // Получает позицию скрола главного окна.
    //
    public static getScrollPosition(): number {

        let supportPageOffset = window.pageYOffset !== undefined;
        let isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

        return supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

    }

    // Скролит до нужной позиции в главном окне.
    //
    public static scrollToPosition(position: number): void {
        if (window.scrollTo && position) {
            window.scrollTo(0, position);
        }

    }

    // Определяет текущую позицию скрола в заданном элементе со скролом.
    //
    public static getElementScrollPosition(element: ElementRef): number {
        return (element.nativeElement.scrollTop) ? element.nativeElement.scrollTop : 0;
    }

    // Скролит внутри элемента со скролом до нужной позиции.
    //
    public static scrollToElementPosition(element: ElementRef, position: number): void {
        if (element.nativeElement.scroll && position) {
            element.nativeElement.scroll(0, position);
        }
    }

    // Определяет виден ли элемент в области видимости.
    //
    public static isScrolledIntoView(element: HTMLElement): boolean {
        if (!("getBoundingClientRect" in element)) {
            return true;
        }
        // https://stackoverflow.com/a/22480938/4604351
        let rect = element.getBoundingClientRect();
        return (rect.top >= 0) && (rect.bottom <= window.innerHeight);
    }


}