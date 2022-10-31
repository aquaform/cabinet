import {REPLACE} from "./universal/replace";

export class Highlight {

    public static mark(container: HTMLElement, words: string[]) {

        for (let word of words) {

            REPLACE.replace(container, {
                find: new RegExp(word, 'gi'),
                wrap: 'mark',
                filterElements: function(el) {
                    return !(el.nodeName === "AUDIO"
                        || el.nodeName === "VIDEO"
                        || el.nodeName === "OBJECT"
                        || el.nodeName === "PRE"
                        || el.nodeName === "SVG"
                        || el.nodeName === "CANVAS"
                        || el.nodeName === "EMBED"
                        || el.nodeName === "FORM" );
                }
            });

        }

    }

}