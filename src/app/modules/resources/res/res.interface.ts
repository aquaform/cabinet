

export class GetAddressRequest {
    search: string;
    base: string;
    closeURL: string;
}

export class GetAddressResponse {
    address?: string; // Адрес файла публикации со старым плеером
    isCourseData?: boolean; // Адрес файла с данными курса для встроенного плеера
    checkSum?: string;
}

export class ResLinkParams {
    electronicCourse?: string; // Электронный курс БЭО // TODO electronicCourse beo
    electronicResource?: string; // Электронный ресурс
    userActivity?: string; // Если в рамках прохождения обучения
    task?: string; // Если это задание
    fragment?: string; // Если надо показать только фрагмент
    providingEducation?: string; // Если открываем ресурс проведения обучения
    user?: string; // Если открываем от лица другого пользователя
    item?: string; // Переход к элементу (???) // TODO res item
    readonly?: boolean;
    currentRoute?: string;
}

export class CourseAPISettings extends ResLinkParams {
    closePath: string;
    storageNamesForClear: string[];
    user: string;
    isTerminate: boolean;
    isUnload: boolean;
    learningActivity: string;
    checkSum: string;
}