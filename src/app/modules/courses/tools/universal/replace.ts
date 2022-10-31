import * as findAndReplaceDOMText from "findandreplacedomtext";

export class REPLACE {

    public static replace(element: HTMLElement, options: any) {
        findAndReplaceDOMText(element, options);
    }

}