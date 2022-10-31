
///////////////////////////////////////////////////////////////////////
// Файл подключается к внешним файлам HTML (ресурсам) из каталога data
//

// Polyfills
//

import "core-js/es/array";
import "core-js/es/map";

// Imports
//

import { CourseDataInterface } from "../interface/data-interface/course-data.interface";
import { BROWSER } from "../tools/universal/browser";
import { ResLinks } from "./res-links";
import { Terms } from "../tools/terms";
import { Highlight } from "../tools/highlight";
import { ResImages } from "./res-images";
import { Scroll } from "../tools/universal/scroll"

// Interfaces
//

export interface ResInitDataInterface {
    courseData: CourseDataInterface;
    highlightWords: string[];
    scrollPosition: number;
}

// Подписываемся на сообщение из плеера
//

window['addEventListener'](
    "message",
    (event) => {
        if (event && "data" in event && typeof event.data === "object" && "courseData" in event.data) {

            const data: ResInitDataInterface = event.data;

            // Подсвечиваем слова
            Highlight.mark(window.document.body, data.highlightWords);

            // Заменяем термины на ссылки
            window['courseData'] = data.courseData;
            Terms.makeLinks(window.document.body);

            // Обрабатываем ссылки
            ResLinks.process();

            // Прокручиваем страницу
            Scroll.scrollToPosition(data.scrollPosition);

        }
    },
    false
);

// Сообщаем родителю события клика
//

window['onload'] = () => {
    window.document.body.onclick = () => {
        window.parent.postMessage("event:click", "*");
    };
};

// Сообщаем текущее положение прокрутки
//

window['onunload'] = () => {
    window.parent.postMessage(`scrollPosition:${Scroll.getScrollPosition()}`, "*");
};

// Убираем показ ошибок в старом IE внутри 1С
//

if (BROWSER.oldIE()) {
    window.onerror = () => {
        return true; // Return true to tell IE we handled it
    };
}

// Обрабатываем картинки
//

new ResImages();