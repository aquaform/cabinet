// Методы для поддержки старых браузеров и
// исправления различных глюков при манипулировании DOM.
//

import {ElementRef} from "@angular/core";
import {BROWSER} from "./universal/browser";
import {Observable} from "rxjs";
import { CourseDataProvider } from '../data/course-data.provider';
import { LocationTools } from "@modules/root/location/location.class";

export class DOM {

    constructor() {

    }

    // Устанавливает точный размер фрейма в старом Safari
    //
    public static setWidthIFrameInOldWebkit(el: ElementRef) {
        if (BROWSER.oldWebkit()) {
            const windowWidth = window.innerWidth;
            const iframe = el.nativeElement.querySelectorAll('iframe');
            for (const frame of iframe) {
                frame.setAttribute("width", String(windowWidth) + "px");
            }
        }
    }

    // Устанавливает innerHTML в старом IE через setTimeout
    //
    public static setInnerHTML(element: ElementRef, html: string): Observable<ElementRef> {
        return new Observable(observer => {
            if (BROWSER.oldIE() || BROWSER.oldWebkit()) {
                // Данный трюк используется для учета глюка в IE и Webkit MAC 1C,
                // когда текст не прорисовывается.
                element.nativeElement.innerHTML = "<div>&nbsp;</div>";
                setTimeout(() => {
                    element.nativeElement.innerHTML = html;
                    setTimeout(() => {
                        observer.next(element);
                        observer.complete();
                    }, 1);
                }, 1);
            } else {
                element.nativeElement.innerHTML = html;
                observer.next(element);
                observer.complete();
            }
        });
    }

    public static setResHref(container: ElementRef) {
        const images = container.nativeElement.querySelectorAll('img');
        for (const image of images) {

            let src = image.getAttribute('src');

            if (LocationTools.isURL(src)) {
                continue;
            }

            if (LocationTools.isDataURL(src)) {
                // Base64 из конфигурации поставляется с замененными символами + и /.
                // Следует их вернуть обратно для корректной работы в браузере.
                src = src.replaceAll("-", "+");
                src = src.replaceAll("_", "/");
            } else {
                src = CourseDataProvider.dataFolderPath() + src;
            }

            image.setAttribute("src", src);
        }
    }

    // Устанавливает размер картинок не больше окна для старых браузеров
    //
    public static setImageSize(container: ElementRef, host?: ElementRef, clientWidth?: number) {

        // Добавляем класс ко всем картинкам

        const images = container.nativeElement.querySelectorAll('img');

        for (const image of images) {
            image.classList.add("courseImage");
        }

        // Выходим, если это не старый IE

        if (!BROWSER.oldIE()) {
            return;
        }

        // Добавляем класс oldIE, чтобы исключить обычные свойства css для других браузеров

        if (!host) {
            host = container;
        }

        if (host.nativeElement.className.search("oldIE") === -1) {
            host.nativeElement.className += " oldIE";
        }

        // Устанавливаем размер картинки в зависимости от размера окна


        const windowWidth = (clientWidth) ? clientWidth - 40 : host.nativeElement.clientWidth - 40;

        for (const image of images) {

            if (!image.hasAttribute("width")
                || !image.getAttribute('width')
                || !image.hasAttribute("height")
                || !image.getAttribute('height')) {

                continue;

            }

            image.style.display = "none";

            if (!image.hasAttribute("oWidth")) {
                image.setAttribute("oWidth", image.getAttribute('width'));
            }

            if (!image.hasAttribute("oHeight")) {
                image.setAttribute("oHeight", image.getAttribute('height'));
            }

            const imageWidth: number = parseInt(image.getAttribute('oWidth'), 10);
            const imageHeight: number = parseInt(image.getAttribute('oHeight'), 10);

            if (imageWidth > windowWidth) {
                image.setAttribute("width", String(windowWidth) + "px");
                image.setAttribute("height", "auto");
            } else {
                image.setAttribute("width", String(imageWidth) + "px");
                image.setAttribute("height", String(imageHeight) + "px");
            }

            setTimeout(() => {
                image.style.display = "block";
            }, 1);

        }

    }

    public static setHeightForOldWebKit(el: ElementRef) {
        // Исправление ошибки в webkit, когда некоторые элементы пропадают.
        // Например, это выражается в том, что при загрузке стартовой страницы
        // теста она остается пустая и появляется только при щелчке на ней.
        // ВАЖНО! Проблема имеет место и в новом Safari, поэтому применяется
        // пока во всех браузерах. В случае обнаружения проблем в других браузерах
        // следует оставить данный хак для всех версий движка webkit.
        if (el && el.nativeElement && el.nativeElement.parentNode) {
            el.nativeElement.style.height = String(el.nativeElement.parentNode.clientHeight) + "px";
        }
    }

}