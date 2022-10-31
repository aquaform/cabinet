import { ArrayElementAPI, ObjectAPI, DateAPI, ConvertValueAPI } from '@modules/root/api/api.converter';
import { ResourceType } from '@modules/resources/resources.interface';

export class LibraryTreeResElement { // Нельзя использовать декораторы
    name: string;
    fragment: string;
    resource: string;
    addDate: number;
    type: ResourceType;
    extension: string;
}

@ArrayElementAPI(LibraryTreeResElement)
export class LibraryTreeResElementArray extends Array<LibraryTreeResElement> {

}

export class LibraryTreeTagElement {
    link: string;
    order: number;
    name: string;
    @ObjectAPI(LibraryTreeResElementArray) resources: LibraryTreeResElementArray;
    // @ObjectAPI(LibraryTreeTagElementArray) для childElements не указано
    // из-за невозможности разрешить противоречие с порядком объявления объектов.
    // Из-за этого в подчиненных элементах нельзя использовать декораторы.
    childElements: LibraryTreeTagElementArray;
}

@ArrayElementAPI(LibraryTreeTagElement)
export class LibraryTreeTagElementArray extends Array<LibraryTreeTagElement> {

}

export class LibraryTreeRootElement {
    id: string;
    name: string;
    type: string;
    @ObjectAPI(LibraryTreeTagElementArray) tags: LibraryTreeTagElementArray;
    @ObjectAPI(LibraryTreeResElementArray) resources: LibraryTreeResElementArray;
}

@ArrayElementAPI(LibraryTreeRootElement)
export class LibraryTreeResponse extends Array<LibraryTreeRootElement>  {

}

export class BreadcrumbsElements {
    current: LibraryTreeElement;
    previous: LibraryTreeElement;
    opened: LibraryTreeElement[];
}

export class LibraryTreeElement { // Нельзя использовать декораторы
    id: string;
    name: string;
    isFolder: boolean;
    res: LibraryTreeResElement;
    parent: string;
}

export type ElectronicResourceType = "course" | "quiz" | "";

export const electronicResourceTypes = {
    course: "course" as ElectronicResourceType,
    quiz: "quiz" as ElectronicResourceType,
};

export const electronicResourceTypeConvert = (electronicResourceTypeRaw: string): ElectronicResourceType => {
    if (electronicResourceTypeRaw === "Тест") {
        return electronicResourceTypes.quiz;
    }
    if (electronicResourceTypeRaw === "ЭлектронныйКурс") {
        return electronicResourceTypes.course;
    }
    return "";
};

export class ElectronicResourceDataElement {
    link: string;
    parent: string;
    isFolder: boolean;
    name: string;
    @DateAPI() modifiedDate: Date;
    @ConvertValueAPI(electronicResourceTypeConvert) type: string;
}

@ArrayElementAPI(ElectronicResourceDataElement)
export class ElectronicResourceDataResponse extends Array<ElectronicResourceDataElement> {

}
