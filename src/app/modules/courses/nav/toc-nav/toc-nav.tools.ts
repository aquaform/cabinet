import {CourseDataInterface, TOCElementInterface} from "../../interface/data-interface/course-data.interface";

declare let courseData: CourseDataInterface;

export class TocNavTools {

    constructor() {
    }

    static tocAvailable(): boolean {
        return ("toc" in courseData && courseData.toc && courseData.toc.elements.length > 0);
    }

    // Находит элемент дерева по идентификатору слайда и\или самого элемента
    //
    static findElements(findElements: TOCElementInterface[], curElements: TOCElementInterface[], uuid?: string, slide?: string): void {
        for (let element of curElements) {
            if (uuid && element.uuid === uuid) {
                findElements.push(element);
            }
            if (slide && element.slide === slide) {
                findElements.push(element);
            }
            if (element.isFolder) {
                TocNavTools.findElements(findElements, element.elements, uuid, slide); // Рекурсия
            }
        }
    }

    // Определяет является ли элемент последнем на каком-либо уровне дерева
    //
    static isLastLevelElement(element: TOCElementInterface): boolean {

        let lastElements = [];
        TocNavTools.lastElements(courseData.toc.elements, 0, lastElements);

        return lastElements.indexOf(element) !== -1;

    }

    // Определяет последний элемент на каждом уровне
    //
    private static lastElements(curElements: TOCElementInterface[], curLevel: number, lastElements: TOCElementInterface[]): void {
        let nextLevel = curLevel + 1;
        for (let element of curElements) {
            TocNavTools.lastElements(element.elements, nextLevel, lastElements); // Рекурсия
            lastElements[curLevel] = element;
        }
    }

}