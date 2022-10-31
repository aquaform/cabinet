import {REPLACE} from "./universal/replace";
import {CourseDataInterface, GlossarySlideDataInterface} from "../interface/data-interface/course-data.interface";

declare let courseData: CourseDataInterface; // global var

interface Term {
    term: string;
    glossary: string;
    limit: number;
    titleLength: number;
    words: Word[];
}

interface Word {
    title: string;
    entry: number[]; // Массив позиций вхождений слова
    limit: number; // Количество замен (-1 - не делать замену, 0 - сколько угодно замен)
    countReplace: number;
}

export class Terms {

    // Возвращает данные глоссария
    //
    public static glossaryData(courseData: CourseDataInterface): GlossarySlideDataInterface {
        if (courseData.glossary) {
            return courseData.slides.find((s) => s.uuid === courseData.glossary) as GlossarySlideDataInterface;
        } else {
            return null;
        }
    }

    // Определяет нужно ли показывать кнопку глоссария в меню
    //
    public static glossaryCommandAvailable(courseData: CourseDataInterface): boolean {
        const glossaryData: GlossarySlideDataInterface = Terms.glossaryData(courseData);
        return (glossaryData && glossaryData.glossary.displayCommand);
    }

    // Заменяет термин на ссылку
    //
    public static makeLinks(container: HTMLElement) {

        const glossaryData = Terms.glossaryData(courseData);

        if (!glossaryData || !glossaryData.glossary.doLinks) {
            return;
        }

        // Формируем массив терминов

        let terms: Term[] = [];

        for (let termData of glossaryData.glossary.terms) {

            if (!termData.makeLinks) {
                continue;
            }

            let term: Term = {
                term: termData.uuid,
                glossary: glossaryData.uuid,
                limit: termData.numberLinks,
                titleLength: termData.title.length,
                words: []

            };

            term.words.push({
                title: termData.title.trim(),
                entry: [],
                limit: 0,
                countReplace: 0
            });

            for (let synonymData of termData.synonyms) {
                if (synonymData.title.trim()) {
                    term.words.push({
                        title: synonymData.title.trim(),
                        entry: [],
                        limit: 0,
                        countReplace: 0
                    });
                }
            }

            terms.push(term);

        }

        // Сортируем термины по длине заголовка

        terms.sort((a: Term, b: Term) => {
            return (a.titleLength > b.titleLength) ? -1 : 1;
        });

        //

        for (let term of terms) {

            // Запоминаем позиции вхождений слов

            for (let word of term.words) {

                REPLACE.replace(container, {
                    find: new RegExp(word.title, 'gi'),
                    replace: (portion: any, match: any) => {
                        word.entry.push(match.startIndex);
                        return portion.text; // Реальной замены не делаем
                    }
                });

            }

            // Устанавливаем лимит замен для каждого слова с учетом порядка вхождения слова

            if (term.limit) {

                // Формируем массив всех вхождений всех слов и сортируем его по возрастанию

                let entries: number[] = [];

                for (let word of term.words) {
                    for (let position of word.entry) {
                        entries.push(position);
                    }
                }

                entries.sort((a: Number, b: Number) => {
                    return (a > b) ? 1 : -1;
                });

                // Устанавливаем лимит замен для каждого слова с учетом порядка вхождения
                // Сначала заменяем первое вхождение и т.д. пока не закончится лимит.

                let curLimit = 0;
                for (let startIndex of entries) {

                    for (let word of term.words) {
                        if (word.entry.findIndex((el) => el === startIndex) !== -1) {
                            word.limit++;
                            curLimit++;
                            if (curLimit >= term.limit) {
                                break;
                            }
                        }
                    }

                    if (curLimit >= term.limit) {
                        break;
                    }

                }

                // Для слов у которых лимит не установлен устанавливаем ему -1,
                // чтобы это слово вовсе не заменялось никогда.

                for (let word of term.words) {
                    if (!word.limit) {
                        word.limit = -1; // Не делаем замену
                    }
                }

            }

        }


        const correctSymbols: string[] = ["\b", "\t", "\n", "\v", "\f", "\r", "\"", "'", "\\", ".", ",", " ", "\u00A0", "!", "?", ";", ":", "[", "]", "{", "}", "(", ")", ""];

        for (let term of terms) {

            for (let word of term.words) {

                if (!word.entry.length) {
                    continue; // Нет вхождения слова
                }

                REPLACE.replace(container, {
                    find: new RegExp(word.title, 'gi'),
                    replace: (portion: any, match: any) => {

                        // Doc: https://github.com/funkyfuture/findAndReplaceDOMText

                        // Цель данного кода определить является ли вхождение слова
                        // целым словом или только его частью. Для этого смотрятся символы
                        // до слова и после. Если они характерны для начала и конца слова,
                        // то слово оборачивается в гиперссылку на термин, иначе возвращается как есть.
                        // Учитываем, что заменные термины пропадают из match.input, так как установлен фильтр
                        // по тегу A.

                        const leftSymbol: string = (match.startIndex) ? match.input.substr(match.startIndex - 1, 1) : "";
                        const rightSymbol: string = (match.endIndex < match.input.length) ? match.input.substr(match.endIndex, 1) : "";

                        // Смотрим не закончился ли лимит ссылок.
                        // Лимит закончился если он задан и замен больше или равно лимиту.
                        const limitOver: boolean = (word.limit && word.countReplace >= word.limit);

                        if (correctSymbols.indexOf(leftSymbol) > -1
                            && correctSymbols.indexOf(rightSymbol) > -1
                            && !limitOver) {

                            word.countReplace++;

                            // Возвращаем ссылку на термин
                            let link = document.createElement('a');
                            link.href = `sdo1c?glossary=${term.glossary}&term=${term.term}`;
                            link.innerHTML = portion.text;
                            return link;

                        } else {

                            return portion.text;

                        }

                    },
                    filterElements: function(el) {
                        // Внутри ссылок и других не текстовых тегах термины НЕ заменяем.
                        return !(el.nodeName === "A"
                            || el.nodeName === "AUDIO"
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

}