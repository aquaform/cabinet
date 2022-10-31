///////////////////////////////////////////////////////////////////////
// Файл формирует глобальные настройки окружения (courseSettings)
//

import { apiModes, CourseSettingsInterface, CourseDataSettingsInterface } from "./settings.interface";
import { LOCATION } from "../tools/universal/location";

// Глобальная переменная courseSettings может быть вставлена сборщиком курса
// в этот файл или формируется исходя из переданных параметров кодом ниже.
declare let courseSettings: CourseSettingsInterface; // global var

let searchObj = LOCATION.searchParams();

if (!window['courseSettings']) {

    // Сборщик курса не вставил настройки в файл

    let newSettings: CourseSettingsInterface = {
        api: {
            name: 'local',
            mode: apiModes.auto,
            supportFileDownload: false
        },
        data: {
            base: 'data',
            storage: 'data',
            container: 'data'
        },
        preventCache: false,
        downloadPDF: false
    };

    // Настройки могут быть переданы в виде параметра data64
    // закодированном в base64
    if (searchObj && 'data64' in searchObj) {
        try {
            newSettings.data = JSON.parse(window.atob(decodeURIComponent(searchObj['data64']))) as CourseDataSettingsInterface;
        } catch (err) {
            console.error("Can not parse atob param");
        }
    }

    if (searchObj && 'data' in searchObj) {
        // Параметр data разделен "/" на два или три элемента:
        // - каталог, где хранятся все данные курса
        // - контейнер данных, который надо загрузить
        // - базовый путь к каталогу data
        let dataParamArray: string[] = searchObj['data'].split("/");
        newSettings.data.storage = dataParamArray[0];
        if (dataParamArray.length > 1) {
            newSettings.data.container = dataParamArray[1];
        }
        if (dataParamArray.length > 2) {
            newSettings.data.base = dataParamArray[2];
        }
    }

    if (searchObj && 'api' in searchObj) {
        newSettings.api.name = searchObj['api'];
    }

    if (searchObj && 'mode' in searchObj) {
        newSettings.api.mode = searchObj['mode'];
    }

    if (searchObj && 'supportFileDownload' in searchObj) {
        newSettings.api.supportFileDownload = searchObj['supportFileDownload'];
    }

    if (searchObj && 'preventCache' in searchObj) {
        newSettings.preventCache = (searchObj.preventCache === 'true');
    }

    if (searchObj && 'downloadPDF' in searchObj) {
        newSettings.downloadPDF = (searchObj.downloadPDF === 'true');
    }

    window['courseSettings'] = newSettings;

}

if (courseSettings && courseSettings.data && !courseSettings.data.base) {
    courseSettings.data.base = "data"; // Для обратной совместимости
}

let rndAdd = LOCATION.rndAdd();

if (courseSettings && courseSettings.data && courseSettings.data.storage) {
    document.write(`<script async src="${courseSettings.data.base}/${courseSettings.data.storage}/${courseSettings.data.container}.js?rnd=${rndAdd}" type="text/javascript"></script>`);
}

let learningName = (searchObj && 'learning' in searchObj) ? searchObj.learning : '';
if (learningName) {
    document.write(`<script src="learning/${learningName}.js?rnd=${rndAdd}" type="text/javascript"></script>`);
}
