import {BehaviorSubject} from "rxjs";

export interface SearchAPIInterface {
    onChange: BehaviorSubject<SearchData>;
    search(text: string): void;
}

export interface SearchData {
    ready: boolean;
    text?: string;
    result?: SearchResultInterface;
}

export interface SearchResultInterface {
    elements: SearchResultElementInterface[];
}

export interface SearchResultElementInterface {
    slide: string;
    title: string;
}