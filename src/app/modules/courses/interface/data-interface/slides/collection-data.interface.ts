import {VideoDataInterface} from "./video-data.interface";
import {QuestionDataInterface} from "./question-data.interface";
import {ImageDataInterface} from "./image-data.interface";
import {HTMLDataInterface} from "./html-data.interface";
import { AudioSlideDataInterface, ContentDataInterface, ExternalDataInterface, PDFSlideDataInterface, VideoSlideDataInterface } from '../course-data.interface';
import { PDFDataInterface } from './pdf-data.interface';
import { AudioDataInterface } from './audio-data.interface';

export type CollectionElementsTypes = "QUESTION" | "IMAGE" | "HTML" | "TEXT" | "PDF" | "VIDEO" | "AUDIO";

export const collectionElementsTypes = {
    QUESTION: "QUESTION" as CollectionElementsTypes,
    IMAGE: "IMAGE" as CollectionElementsTypes,
    HTML: "HTML" as CollectionElementsTypes,
    TEXT: "TEXT" as CollectionElementsTypes,
    PDF: "PDF" as CollectionElementsTypes,
    VIDEO: "VIDEO" as CollectionElementsTypes,
    AUDIO: "AUDIO" as CollectionElementsTypes
};

export interface CollectionDataInterface {
    uuid: string;
    elements: CollectionElementDataInterface[];
}

export interface CollectionElementDataInterface {
    uuid: string;
    type: CollectionElementsTypes;
    title?: string;
    question?: QuestionDataInterface;
    video?: VideoDataInterface;
    image?: ImageDataInterface;
    html?: HTMLDataInterface;
    text?: ContentDataInterface;
    pdf?: PDFDataInterface;
    audio?: AudioDataInterface;
    hidden: boolean; // TODO: Не используется
}

export interface PDFCollectionElementDataInterface extends CollectionElementDataInterface, PDFSlideDataInterface {
    pdf: PDFDataInterface;
    type: "PDF";
}

export interface VideoCollectionElementDataInterface extends CollectionElementDataInterface, VideoSlideDataInterface {
    video: VideoDataInterface;
    type: "VIDEO";
}

export interface AudioCollectionElementDataInterface extends CollectionElementDataInterface, AudioSlideDataInterface {
    audio: AudioDataInterface;
    type: "AUDIO";
}