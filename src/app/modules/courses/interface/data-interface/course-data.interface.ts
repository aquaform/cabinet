import {QuizDataInterface} from "./slides/quiz-data.interface";
import {VideoDataInterface} from "./slides/video-data.interface";
import {CollectionDataInterface} from "./slides/collection-data.interface";
import {AudioDataInterface} from "./slides/audio-data.interface";
import {ImageDataInterface} from "./slides/image-data.interface";
import {YouTubeDataInterface} from "./slides/youtube-data.interface";
import {HTMLDataInterface} from "./slides/html-data.interface";
import {SCODataInterface} from "./slides/sco-data.interface";
import {ArchiveDataInterface} from "./slides/archive-data.interface";
import {PDFDataInterface} from "./slides/pdf-data.interface";
import {GlossaryDataInterface} from "./slides/glossary-data.interface";

//////////////////////////////////////////////////////////////////////////////////
// ДАННЫЕ КУРСА

export type CloseButtonsPosition = "auto" | "hidden" | "left" | "right" | "leftFix" | "rightFix";

export const closeButtonsPositions = {
    auto: "auto" as CloseButtonsPosition,
    hidden: "hidden" as CloseButtonsPosition,
    left: "left" as CloseButtonsPosition,
    right: "right" as CloseButtonsPosition,
    leftFix: "leftFix" as CloseButtonsPosition,
    rightFix: "rightFix" as CloseButtonsPosition,
};

export interface CourseDataInterface {
    title: string;
    uuid: string;
    checkSum?: string;
    closeButtonPosition?: CloseButtonsPosition;
    slides: SlideDataInterface[]; // Элементы курса
    toc?: TOCInterface; // Дерево основных элементов
    links?: LinkDataInterface[]; // Ссылки в старом формате редакции 3.0
    glossary?: string; // Идентификатор основного глоссария
    search?: SearchDataInterface; // Данные полнотекстового поиска
}

//////////////////////////////////////////////////////////////////////////////////
// СОДЕРЖАНИЕ

export interface TOCInterface  {
   elements: TOCElementInterface[];
}

export interface TOCElementInterface  {
    title: string;
    uuid: string;
    hidden: boolean;
    slide: string; // uuid слайда (совпадает с uuid для элементов)
    parent: string; // uuid родителя
    isFolder: boolean;
    elements: TOCElementInterface[];
    opened: boolean; // Раскрыта ветка дерева
}

//////////////////////////////////////////////////////////////////////////////////
// СЛАЙДЫ

// Слайд
//
export interface SlideDataInterface  {
    uuid: string;
    type: SlidesTypes;
    hidden: boolean;
    external?: ExternalDataInterface;
}

// Данные слайда, хранящиеся в отдельных файлах
//
export interface ExternalDataInterface {
    src: string;
    property: string;
}

// Типы слайдов
//
export type SlidesTypes = "START" | "VIDEO" | "IMAGE" | "AUDIO" | "QUIZ" | "TEXT" | "WORD" | "COLLECTION" | "FINAL" | "YOUTUBE" | "HTML" | "SCO" | "ARCHIVE" | "PDF" | "GLOSSARY";

export const slidesTypes = {
    START: "START" as SlidesTypes,
    VIDEO: "VIDEO" as SlidesTypes,
    IMAGE: "IMAGE" as SlidesTypes,
    AUDIO: "AUDIO" as SlidesTypes,
    QUIZ: "QUIZ" as SlidesTypes,
    TEXT: "TEXT" as SlidesTypes,
    WORD: "WORD" as SlidesTypes,
    COLLECTION: "COLLECTION" as SlidesTypes,
    FINAL: "FINAL" as SlidesTypes,
    YOUTUBE: "YOUTUBE" as SlidesTypes,
    HTML: "HTML" as SlidesTypes,
    SCO: "SCO" as SlidesTypes,
    ARCHIVE: "ARCHIVE" as SlidesTypes,
    PDF: "PDF" as SlidesTypes,
    GLOSSARY: "GLOSSARY" as SlidesTypes
};

// Текстовый слайд
//
export interface TextSlideDataInterface extends SlideDataInterface {
    text: ContentDataInterface;
}

// Стартовый слайд
//
export interface StartSlideDataInterface extends SlideDataInterface {
    text: ContentDataInterface;
}

// Финальный слайд
//
export interface FinalSlideDataInterface extends SlideDataInterface {
    text: ContentDataInterface;
}

// Видео слайд
//
export interface VideoSlideDataInterface extends SlideDataInterface {
    video: VideoDataInterface;
}

// Картинка слайд
//
export interface ImageSlideDataInterface extends SlideDataInterface {
    image: ImageDataInterface;
}

// Аудио слайд
//
export interface AudioSlideDataInterface extends SlideDataInterface {
    audio: AudioDataInterface;
}

// Слайд с тестом
//
export interface QuizSlideDataInterface extends SlideDataInterface {
    quiz: QuizDataInterface;
}

// Слайд word
//
export interface WordSlideDataInterface extends SlideDataInterface {
    doc: string;
}

// Слайд html
//
export interface HTMLSlideDataInterface extends SlideDataInterface {
    html: HTMLDataInterface;
}

// Слайд SCO
//
export interface SCOSlideDataInterface extends SlideDataInterface {
    sco: SCODataInterface;
}

// Слайд YouTube
//
export interface YouTubeSlideDataInterface extends SlideDataInterface {
    youtube: YouTubeDataInterface;
}

// Слайд Archive
//
export interface ArchiveSlideDataInterface extends SlideDataInterface {
    archive: ArchiveDataInterface;
}

// Слайд PDF
//
export interface PDFSlideDataInterface extends SlideDataInterface {
    pdf: PDFDataInterface;
}

// Слайд с набором элементов
//
export interface CollectionSlideDataInterface extends SlideDataInterface {
    collection: CollectionDataInterface;
}

// Слайд глоссария
//
export interface GlossarySlideDataInterface extends SlideDataInterface {
    glossary: GlossaryDataInterface;
}

//////////////////////////////////////////////////////////////////////////////////
// РАЗНОЕ

// Ссылка в старом формате ред. 3.0
//
export interface LinkDataInterface {
    href: string;
    slide: string;
    collectionElement: string;
}

// Поле с некоторым контентом (определение термина, текст вопроса и т.п.)
//
export interface ContentDataInterface {
    encoded: boolean;
    data: string;
}

//////////////////////////////////////////////////////////////////////////////////
// ПОИСК

export interface SearchDataInterface {
    index: LocalSearchIndexDataInterface;
}

export interface LocalSearchIndexDataInterface {
    type: "RAW";
    data: RawSearchIndexDataInterface;
}

export interface RawSearchIndexDataInterface {
    elements: RawSearchIndexElementDataInterface[];
}

export interface RawSearchIndexElementDataInterface {
    slide: string;
    title: string;
    text: ContentDataInterface;
}