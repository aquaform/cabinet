export class OBJECTS {

    // Преобразует строку параметров url в структуру
    //
    public static paramsToObject(paramsString: string): any {
        return paramsString ? JSON.parse('{"' + paramsString.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
            function (key, value) {
                return key === "" ? value : decodeURIComponent(value);
            }) : {};
    }

    // Применяет функцию к каждому свойству объекта
    //
    public static iterate(obj: any, func: any): void {

        for (let property in obj) {
            if (obj.hasOwnProperty(property)) {
                obj[property] = func(property, obj[property]);
                if (typeof obj[property] === "object") {
                    OBJECTS.iterate(obj[property], func);
                }
            }
        }

    }



}