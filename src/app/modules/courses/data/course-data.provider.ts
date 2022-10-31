import * as CryptoUTF8 from "crypto-js/enc-utf8.js";
import * as CryptoBase64 from "crypto-js/enc-base64.js";
import {
    CloseButtonsPosition,
    closeButtonsPositions,
    ContentDataInterface, CourseDataInterface,
    TOCElementInterface
} from "../interface/data-interface/course-data.interface";
import { HTMLDataInterface } from "../interface/data-interface/slides/html-data.interface";
import { CourseSettingsProvider } from "../settings/settings.provider";
import { BROWSER } from "../tools/universal/browser";
import { LOCATION } from "../tools/universal/location";
import { Observable } from "rxjs";
import { merge } from "rxjs";
import { Injectable } from "@angular/core";

declare let courseData: CourseDataInterface; // Данные курсы видны глобально

@Injectable()
export class CourseDataProvider {

    constructor() {
    }

    // Ждет загрузки данных 20 секунд
    // Эмитит значение в любом случае, даже
    // если не дождались
    //
    public static loadData: Observable<void> = new Observable((observer) => {
        let timer = 1;
        const interval = 5;
        const timeout = 20000 / interval; // ждем 20 секунд
        const timerId = setInterval(() => {

            timer++;

            if (('courseData' in window && !!window['courseData'])) {

                clearInterval(timerId);

                const externalSlides = courseData.slides.filter((s) => !!s.external);

                if (!externalSlides.length) {
                    observer.next();
                    observer.complete();
                    return;
                }

                const externalLoaders: Observable<{}>[] = [];

                for (const slide of externalSlides) {
                    const externalLoader = new Observable((observer2) => {
                        const http = new XMLHttpRequest();
                        http.open("GET", CourseDataProvider.dataFolderPath() + slide.external.src, true);
                        http.onreadystatechange = () => {
                            if (http.readyState === 4) {
                                if (http.status === 200) {
                                    slide[slide.external.property] = JSON.parse(http.responseText);
                                    observer2.next(null);
                                    observer2.complete();
                                } else {
                                    observer2.error(http.statusText);
                                }
                            }
                        };
                        http.send(null);
                    });
                    externalLoaders.push(externalLoader);
                }

                merge(...externalLoaders).subscribe(
                    () => {},
                    (err) => {
                        console.error(err);
                        window['courseData'] = null;
                        observer.next();
                        observer.complete();
                    },
                    () => {
                        observer.next();
                        observer.complete();
                    }
                );

            }

            if (timer > timeout) {
                clearInterval(timerId);
                observer.next();
                observer.complete();
            }

        }, interval);
    });

    public static clearData() {
        window['courseData'] = null;
        window['learningData'] = null;
        window['courseSettings'] = null;
        window['courseAPISettings'] = null;
    }

    // Получает данные курса
    //
    public static getData(content: ContentDataInterface): string {
        if (!content) {
            return "";
        }
        if (content.encoded) {
            // Раскодируем данные
            content.data = CryptoBase64.parse(content.data).toString(CryptoUTF8);
            // Отмечаем, что данные раскодированы
            content.encoded = false;
        }
        return content.data;
    }

    public static frameURL(html: HTMLDataInterface): string {
        let url = CourseDataProvider.dataFolderPath() + html.path;
        if (html.parameters) {
            url += "?" + html.parameters;
        }
        if (BROWSER.oldWebkit()) {
            // параметр rnd для старых Webkit
            url += (html.parameters) ? "&" : "?";
            url += "rnd4002580234=" + LOCATION.rndAdd();
        }
        return url;
    }

    public static dataFolderPath() {
        return CourseSettingsProvider.get("data.base") + "/" + CourseSettingsProvider.get("data.storage") + "/";
    }

    public static findTocElement(slide?: string, item?: string, parentNode?: TOCElementInterface): TOCElementInterface {

        if (!courseData.toc) {
            return undefined;
        }

        const elements: TOCElementInterface[] = (parentNode && "elements" in parentNode && parentNode.elements)
            ? parentNode.elements : courseData.toc.elements;

        let element: TOCElementInterface;

        for (const curElement of elements) {
            if (slide && curElement.slide === slide) {
                element = curElement;
            } else if (item && curElement.uuid === item) {
                element = curElement;
            } else {
                element = CourseDataProvider.findTocElement(slide, item, curElement); // Рекурсия
            }
            if (element) {
                break;
            }
        }

        return element;

    }

    public static courseTitle(): string {
        return courseData.title;
    }

    public static closeButtonPosition(): CloseButtonsPosition {
        return (!!courseData.closeButtonPosition) ? courseData.closeButtonPosition : "auto";
    }

}