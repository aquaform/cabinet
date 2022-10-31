import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@modules/root/settings/settings.service';
import { map, catchError, tap } from 'rxjs/operators';
import { APIServiceName, BaseResponse, APIDataType, APIDataTypes, APIServiceNames } from './api.interface';
import { APITerms } from './api.terms';
import { AnyObject } from '@shared/common.interface';
import * as xml2js from 'xml-js';
import { toConvertValueAPI, objectMustBeArray } from './api.converter';
import { FileToUpload } from '../upload/upload.interface';
import { DatesTools } from '../dates/dates.class';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private settings: SettingsService) {
  }

  // Получает экземпляр класса на основе объекта
  //
  public static getInstanceClass<D extends AnyObject>(
    data: D, classTemplate: { new(): D }, parent?: AnyObject): D {

    // Создаем экземпляр требуемого класса.
    const instanceClass = new classTemplate();
    if (parent) {
      (instanceClass as any)._parent = parent;
    }
    // После преобразования из XML а массив, если
    // массив содержит один элемент, то он становится объектом,
    // а не массивом. Превращаем объект в массив, если так указано
    // в классе.
    const mustBeArray = objectMustBeArray(data, instanceClass);
    let dataToProcess: D | D[] = data;
    if (mustBeArray && !Array.isArray(data)) {
      dataToProcess = [data];
    }

    // Проходим по всем свойствам объекта или массива
    // и заполняем экземпляр класса.
    for (const key of Object.keys(dataToProcess)) {
      const kk = key as keyof D;
      const result = toConvertValueAPI(dataToProcess, instanceClass, key);
      if (result.childClass) {
        // Создаем подчиненный класс
        instanceClass[kk] = ApiService.getInstanceClass(dataToProcess[key], result.childClass, instanceClass);
      }
      if (result.converter) {
        // Просто конвертируем значение
        instanceClass[kk] = result.converter(dataToProcess[key]);
      }
    }

    // Возвращаем заполненный класс
    return instanceClass;

  }

  public Get<DataInterface extends AnyObject>(
    path: string,
    data: {} | string,
    service: APIServiceName,
    searchParams: string,
    classTemplate: { new(): DataInterface },
    dataType?: APIDataType,
    asParamString?: boolean,
    asBeacon?: boolean,
  ): Observable<DataInterface> {

    if (!dataType) {
      dataType = APIDataTypes.json;
    }

    let dataToSend = (typeof data === "object") ? this.processRequestData(data) : data;
    dataToSend = (asParamString && typeof dataToSend === "object") ? this.objectToParamString(dataToSend) : dataToSend;

    const url: string = this.settings.ServiceURL(service) + "/" + path + searchParams;

    const convertError = catchError((err) => {
      if (err && typeof err === "object" && "error" in err && this.ValidateResponse(err.error)) {
        const baseResponse = err.error as BaseResponse;
        this.ConvertTerms(baseResponse.data);
        return throwError(baseResponse); // Проталкиваем тело запроса
      }
      return throwError(err);
    });

    const tapJSONResponse = tap((response: BaseResponse) => {
      if (this.ValidateResponse(response)) {
        if (response.error) {
          return throwError(response); // Проталкиваем тело запроса, как ошибку
        }
        return; // Проталкиваем нормальный ответ сервера
      }
      return throwError("Invalid server response"); // Неизвестный ответ сервера
    });

    const mapJSONResponse = map((response: BaseResponse) => {
      if (!response.data) {
        return null;
      }
      this.ConvertTerms(response.data);
      return ApiService.getInstanceClass<DataInterface>(response.data as DataInterface, classTemplate);
    });

    const mapTextResponse = map((response: BaseResponse) => {
      return response.data as DataInterface;
    });

    const convertXMLToJSONResponse = map((response: string): BaseResponse => {
      // https://www.npmjs.com/package/xml-js
      const jsonResponse = xml2js.xml2js(response, {
        compact: true,
        ignoreDeclaration: true,
        nativeType: true,
        trim: true,
        ignoreAttributes: false,
        elementNameFn: (value, parentElement) => {
          return value.split(":").pop(); // Убираем namespace, например, "d2p1:..."
        }
      });
      return {
        data: jsonResponse,
        error: ""
      };
    });

    if (asBeacon && navigator && navigator.sendBeacon) {

      return (navigator.sendBeacon(url, JSON.stringify(dataToSend)))
        ? of(null) : throwError('Can not send beacon request');

    } else {

      if (dataType === APIDataTypes.json) {
        return this.http.post(url, dataToSend).pipe(
          convertError,
          tapJSONResponse,
          mapJSONResponse
        );
      }

      if (dataType === APIDataTypes.text) {
        return this.http.post(url, dataToSend).pipe(
          convertError,
          tapJSONResponse,
          mapTextResponse
        );
      }

      if (dataType === APIDataTypes.xml) {
        return this.http.post(url, dataToSend, { responseType: 'text' }).pipe(
          convertError,
          convertXMLToJSONResponse,
          tapJSONResponse,
          mapJSONResponse
        );
      }

    }

    throw new Error("Unknown api data type");

  }

  public ValidateResponse(response: any): boolean {
    return (response
      && typeof response === "object"
      && "error" in response
      && "data" in response
      && Object.keys(response).length === 2);
  }



  private processRequestData(data: AnyObject) {
    if (Array.isArray(data)) {
      return data;
    }
    const copyData = Object.assign({}, data);
    for (const key of Object.keys(copyData)) {
      if (DatesTools.IsDate(copyData[key])) {
        copyData[key] = copyData[key].getTime();
      }
    }
    return copyData;
  }

  private fileDataToParamString(fileData: FileToUpload): string {
    return this.objectToParamString({
      fileName: fileData.description.name,
      fileSize: fileData.description.size,
      fileDateModified: fileData.description.lastModified,
      fileBase64Data: fileData.base64Data
    });
  }

  public filesDataToParamString(files: FileToUpload[]): string {
    let paramString = '';
    if (!files || !files.length) {
      return paramString;
    }
    for (const file of files) {
      paramString += this.fileDataToParamString(file);
    }
    return paramString;
  }

  private objectToParamString(data: AnyObject): string {

    let paramString = '';

    for (const key of Object.keys(data)) {

      if (key === 'files') {
        const files = data[key] as FileToUpload[];
        paramString += this.filesDataToParamString(files);
      } else {
        const value = String(data[key]).replace(/:/g, "%3A").replace(/;/g, "%3B");
        paramString += String(key) + ':' + value + ';';
      }

    }

    return paramString;

  }

  public ConvertTerms(data: {}): void {

    const translateTerm = (term: string): string => {
      for (const translatedTerm of Object.keys(APITerms)) {
        if (APITerms[translatedTerm] === term.trim()) {
          return translatedTerm;
        }
      }
      return term;
    };

    const iterate = (element: any): void => {
      if (element && typeof element === "object") {
        for (const key of Object.keys(element)) {
          // Переводим термин на английский
          const translatedKey = translateTerm(key);
          if (translatedKey !== key) {
            element[translatedKey] = element[key];
            delete element[key];
          }
          // Преобразуем результат конвертации значений XML в простые значения
          if (element[translatedKey] && typeof element[translatedKey] === "object") {
            const elementKeys = Object.keys(element[translatedKey]);
            if (elementKeys.length === 1 && elementKeys[0] === "_text") {
              element[translatedKey] = element[translatedKey]._text;
            }
            if (elementKeys.length === 0) {
              element[translatedKey] = null;
            }
          }
          // Убираем пустые идентификаторы
          if (element[translatedKey] === "00000000-0000-0000-0000-000000000000") {
            element[translatedKey] = "";
          }
          // Рекурсивно преобразуем вложенный объект
          if (element[translatedKey] && typeof element[translatedKey] === "object") {
            iterate(element[translatedKey]);
          }
        }
      }
    };

    iterate(data);

  }



}
