import * as lunr from 'lunr';
import * as stemmerSupport from "lunr-languages/lunr.stemmer.support.js";
import * as ru from "lunr-languages/lunr.ru.js"
import * as multiLanguage from "lunr-languages/lunr.multi.js";
import {CourseDataInterface} from "../../../interface/data-interface/course-data.interface";
import {SearchAPIInterface, SearchData, SearchResultInterface} from "../search-api.interface";
import {BehaviorSubject} from "rxjs";
import {CourseDataProvider} from "../../../data/course-data.provider";
import {Index} from "lunr";

stemmerSupport(lunr);
ru(lunr);
multiLanguage(lunr);

declare let courseData: CourseDataInterface; // Данные курсы видны глобально

export class LocalSearchAPI implements SearchAPIInterface {

    public onChange: BehaviorSubject<SearchData> = new BehaviorSubject<SearchData>({ready: false});

    private index: lunr.Index;

    constructor() {

        this.index = lunr((builder) => {

            builder.use(lunr["multiLanguage"]('en', 'ru'));
            builder.field('text');
            builder.field('title');

            for (let elm of courseData.search.index.data.elements) {
                builder.add({
                    "text": CourseDataProvider.getData(elm.text),
                    "title": elm.title,
                    "id": elm.slide
                });
            }

            this.onChange.next({
                ready: true
            });

        });

    }

    search(text: string) {
        let searchResults: Index.Result[] = this.index.search(text);
        let results: SearchResultInterface = {
            elements: []
        };
        for (let result of searchResults) {
            let slideUUID: string = result.ref;
            let title: string = courseData.search.index.data.elements.find((el) => el.slide === slideUUID).title;
            results.elements.push({
                slide: slideUUID,
                title: title
            })
        }
        this.onChange.next({
            ready: true,
            text: text,
            result: results
        });
    }

}