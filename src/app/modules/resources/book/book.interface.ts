import { ObjectAPI, ArrayElementAPI } from '@modules/root/api/api.converter';

export class BookData {
    id: string;
    name: string;
}

export class BookDescriptionContentElement {
    name: string;
    number: number;
    marked: boolean;
}

@ArrayElementAPI(BookDescriptionContentElement)
export class BookDescriptionContentElementsArray extends Array<BookDescriptionContentElement> {
}

export class BookDescriptionContent {
    @ObjectAPI(BookDescriptionContentElementsArray) itemElectronicResource: BookDescriptionContentElementsArray;
}

export class BookDescriptionAuthorElement {
    personalName: string;
    number: number;
}

@ArrayElementAPI(BookDescriptionAuthorElement)
export class BookDescriptionAuthorsArray extends Array<BookDescriptionAuthorElement> {
}

export class BookDescriptionAuthors {
    @ObjectAPI(BookDescriptionAuthorsArray) author: BookDescriptionAuthorsArray;
}

export class BookDescriptionKeyWords {
    word: string[];
}

export class BookDescriptionFileElement {
    extension: string;
    id: string;
    name: string;
    size: number;
}

@ArrayElementAPI(BookDescriptionFileElement)
export class BookDescriptionFilesArray extends Array<BookDescriptionFileElement> {
}

export class BookDescriptionFiles {
    @ObjectAPI(BookDescriptionFilesArray) file: BookDescriptionFilesArray;
}

export class BookDescription {
    ISBN: string;
    id: string;
    name: string;
    UDK: string;
    BBK: string;
    @ObjectAPI(BookDescriptionContent) content: BookDescriptionContent;
    @ObjectAPI(BookDescriptionAuthors) authors: BookDescriptionAuthors;
    @ObjectAPI(BookDescriptionKeyWords) keyWords: BookDescriptionKeyWords;
    webLink: string;
    @ObjectAPI(BookDescriptionFiles) files: BookDescriptionFiles;

    description: string;
}

export class BookDescriptionDataResponse {
    @ObjectAPI(BookDescription) book: BookDescription;
}

export class BookDescriptionData {
    @ObjectAPI(BookDescriptionDataResponse) response: BookDescriptionDataResponse;
}
