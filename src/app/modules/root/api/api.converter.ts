import { AnyClass, AnyObject, AnyFunction } from '@shared/common.interface';
import * as dayjs from 'dayjs';

const APIMetadataPrefix = "_API_";
const objectPostfixAPI = APIMetadataPrefix + "CHILD_";
const arrayElementsPostfixAPI = APIMetadataPrefix + "arrayElements";

// Конвертер простых значений любой функцией
//
export const ConvertValueAPI = (converter: (val: any) => any) => {
    return (classPrototype: any, propertyKey: string) => {
        classPrototype[APIMetadataPrefix + propertyKey] = converter;
    };
};

// Конвертер дат
//
export const numberToDate = (val: any) => {
    if (val === undefined) {
        return new Date(0);
    }
    return new Date(val);
};
export const DateAPI = () => {
    return ConvertValueAPI(numberToDate);
};

export const numberToString = (val: any) => {
    if (val === undefined) {
        return "";
    }
    return dayjs(val).format('LLL');
};
export const DateAsStringAPI = () => {
    return ConvertValueAPI(numberToString);
};

// Режем строки
const trimString = (val: any) => {
    if (typeof val === 'string' && val) {
        return val.trim();
    }
    return val;
};
export const TrimAPI = () => {
    return ConvertValueAPI(trimString);
};

// Конвертер подчиненных объектов
//

export const ObjectAPI = (element: AnyClass) => {
    return (classPrototype: any, propertyKey: string) => {
        classPrototype[objectPostfixAPI + propertyKey] = element;
    };
};

// Конвертер элементов массива
//
export function ArrayElementAPI(element: AnyClass) {
    return <T extends AnyClass>(constructor: T) => {
        const newClass = class extends constructor {};
        newClass.prototype[arrayElementsPostfixAPI] = element;
        return newClass;
    };
}

// Конвертер по умолчанию
//
const EmptyConverter: AnyFunction = (val: any): any => {
    return val;
};

export const objectMustBeArray = (anyObject: AnyObject, anyInstanceClass: AnyObject): boolean => {
    return (arrayElementsPostfixAPI in anyInstanceClass);
};

// Вернет класс, которому соответствует свойство или функцию конвертации
//
export const toConvertValueAPI = (anyObject: AnyObject, anyInstanceClass: AnyObject, key: string): {
    childClass: AnyClass;
    converter: AnyFunction;
} => {

    let childClass = null;
    let converter = null;

    if (Array.isArray(anyObject) && (arrayElementsPostfixAPI in anyInstanceClass)) {
        childClass = anyInstanceClass[arrayElementsPostfixAPI] as AnyClass;
    }
    if (typeof anyObject[key] === "object" && anyObject[key] && objectPostfixAPI + key in anyInstanceClass) {
        childClass = anyInstanceClass[objectPostfixAPI + key] as AnyClass;
    }
    if (!childClass) {
        if ((APIMetadataPrefix + key) in anyInstanceClass) {
            converter = anyInstanceClass[APIMetadataPrefix + key] as AnyFunction;
        } else {
            converter = EmptyConverter;
        }
    }

    return {
        childClass: childClass,
        converter: converter
    };
};
