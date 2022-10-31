export interface CourseSettingsInterface {
    api: CourseAPISettingsInterface;
    data: CourseDataSettingsInterface;
    preventCache: boolean; // Если Истина, то некоторые данные не будут
    // загружаться из кэша сервера (диска), а всегда браться актуальными.
    downloadPDF: boolean; // Вместо просмотра будет предложено загрузить PDF
}

export interface CourseAPISettingsInterface {
    name: string;
    mode: APIModes;
    supportFileDownload: boolean;
}

export interface CourseDataSettingsInterface {
    storage: string; // Каталог хранения всех данных (ресурсов) курса
    container: string; // Конкретный контейнер данных курсов (по умолчанию data)
    base: string; // Относительно этого пути указываются все адреса в файле data.js
}

export type APIModes = "editor" | "auto";

export const apiModes = {
    editor: "editor" as APIModes, // Просматривается фрагмент курса в режиме редактирования
    auto: "auto" as APIModes,
};