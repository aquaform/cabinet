import {ContentDataInterface} from "../course-data.interface";

export interface GlossaryDataInterface {
    displayCommand: boolean;
    doLinks: boolean;
    terms: TermDataInterface[];
}

export interface TermDataInterface {
    uuid: string;
    title: string;
    letter: string;
    description: ContentDataInterface;
    makeLinks: boolean;
    numberLinks: number;
    synonyms: TermSynonymDataInterface[];
}

export interface TermSynonymDataInterface {
    title: string;
    letter: string;
}