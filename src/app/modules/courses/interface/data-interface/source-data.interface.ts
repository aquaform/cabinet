import { SlidesTypes } from "./course-data.interface";

export interface SourceDataInterface {
    uuid: string;
    title: string;
    nests: SourceNestInterface[];
}

export interface SourceNestInterface {
    uuid: string;
    title: string;
    type: NestType;
    source: SourceFileInterface[];
    slides: SourceSlideInterface[];
}

export interface SourceFileInterface {
    path: string;
}

export interface SourceSlideInterface {
    uuid: string;
    type: SlidesTypes;
    files: SourceFileInterface[];
}

export type NestType = "QUIZ" | "VIDEO" | "IMAGE" | "AUDIO" | "WORD" | "YOUTUBE" | "ARCHIVE" | "PDF" | "PRESENTATION" ;

export const nestTypes = {
    QUIZ: "QUIZ" as NestType,
    VIDEO: "VIDEO" as NestType,
    IMAGE: "IMAGE" as NestType,
    AUDIO: "AUDIO" as NestType,
    WORD: "WORD" as NestType,
    YOUTUBE: "YOUTUBE" as NestType,
    ARCHIVE: "ARCHIVE" as NestType,
    PDF: "PDF" as NestType,
    PRESENTATION: "PRESENTATION" as NestType,
};