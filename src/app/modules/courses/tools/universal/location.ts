import {OBJECTS} from "./objects";
import {CourseSettingsProvider} from "../../settings/settings.provider";

export class LOCATION {

    // Получает структуру строки поиска URL
    //
    public static searchParams(): any {
        const search = location.search.substring(1);
        return OBJECTS.paramsToObject(search);
    }

    public static rndAdd(): string {
        return (CourseSettingsProvider.get("preventCache")) ? String(new Date().getTime()) : '';
    }

}