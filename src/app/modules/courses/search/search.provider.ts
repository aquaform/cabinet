import {Injectable} from "@angular/core";
import {CourseDataInterface} from "../interface/data-interface/course-data.interface";
import {SearchAPIInterface, SearchData} from "./api/search-api.interface";
import {LocalSearchAPI} from "./api/implement/local";
import {BehaviorSubject, Subject} from "rxjs";

declare let courseData: CourseDataInterface; // Данные курсы видны глобально

@Injectable({
    providedIn: 'root'
})
export class SearchProvider {

    onChange: BehaviorSubject<SearchData>;

    private api: SearchAPIInterface;

    constructor() {

    }

    public static searchCommandIsAvailable(): boolean {
        return !!("search" in courseData && courseData.search);
    }

    init(ngUnsubscribe: Subject<void>) {
        if (SearchProvider.searchCommandIsAvailable()) {
            this.api = new LocalSearchAPI();
            this.onChange = this.api.onChange;
        } else {
            this.onChange = new BehaviorSubject<SearchData>({ready: false});
        }
    }

    public highlightWords(): string[] {
        const searchData = this.onChange.getValue();
        let words: string[] = [];
        if (searchData.ready && searchData.text) {
            words.push(searchData.text);
        }
        return words;
    }

    search(text: string): void {
        if (text) {
            this.api.search(text);
        } else {
            this.clear();
        }

    }

    clear(): void {
        const curData = this.onChange.getValue();
        this.onChange.next({ready: curData.ready});
    }

}