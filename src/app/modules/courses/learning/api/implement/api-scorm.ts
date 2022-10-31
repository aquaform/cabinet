/**
 * Created by Baranoshnikov on 23.06.2017.
 */

import {APIClassInterface} from "../api.interface";
import {ActivityInterface, LearningInterface} from "../../../interface/learning-interface/learning.interface";
import {Subject} from "rxjs";
import {StandardProcessingInterface} from "../../../tools/universal/processing";

interface SCORM2004Interface {
    Initialize(emptyString: string): string;
    GetLastError(): string;
    GetDiagnostic(emptyString: string): string;
    GetErrorString(errCode: string): string;
    Commit(emptyString: string): string;
    SetValue(name: string, value: string): string;
    GetValue(name: string): string;
    Terminate(emptyString: string): string;
}

export class SCORMAPI implements APIClassInterface {

    public onLoad: Subject<LearningInterface>;
    public onError: Subject<string> = new Subject();

    constructor() {

        this.onLoad = new Subject();

        this.initialize();

        let entry = this.getDataValue("cmi.entry");
        let learningData: LearningInterface = undefined;

        if (entry === "ab-initio") {

            this.setDataValue("cmi.completion_status", "incomplete");
            this.setDataValue("cmi.exit", "suspend");

        } else {

            let suspend_data = this.getDataValue("cmi.suspend_data");

            if (suspend_data) {
                try {
                    learningData = JSON.parse(suspend_data);
                } catch (err) {
                    console.error('Error:' + err.name + ":" + err.message + "\n" + err.stack);
                    console.error("Error parse learning data: " + suspend_data);
                }
            }

            this.setDataValue("cmi.suspend_data", suspend_data);

        }

        this.commitData();

        setTimeout(() => {
            this.onLoad.next(learningData);
        });

    }

    save(learningData: LearningInterface, activities: Array<ActivityInterface>, isTerminate: boolean, isUnload: boolean) {

        let suspend_data = JSON.stringify(learningData);

        if (learningData.complete) {

            this.setDataValue("cmi.progress_measure", String(1));
            this.setDataValue("cmi.completion_status", "completed");
            this.setDataValue("cmi.score.max", String(100));
            this.setDataValue("cmi.score.min", String(0));
            this.setDataValue("cmi.score.raw", String(learningData.score));
            this.setDataValue("cmi.score.scaled", String(learningData.score / 100));

        } else {

            this.setDataValue("cmi.progress_measure", String(learningData.progress / 100));
            this.setDataValue("cmi.completion_status", "incomplete");

        }

        this.setDataValue("cmi.exit", "suspend"); // Только одна попытка
        this.setDataValue("cmi.suspend_data", suspend_data);

        this.commitData();

        if (isTerminate) {
            this.terminate();
        }

    }

    closeCommandIsAvailable() {
        return false;
    }

    historyCommandsIsAvailable() {
        return false;
    }

    beforeOpenSlide(uuidSlide: string,  standardProcessing: StandardProcessingInterface) {
    }

    downloadFile(sURL: string, standardProcessing: StandardProcessingInterface) {
    }


    ////////////////////////////////////////////////////////////////////////////////////
    // Fork APIWrapper.js

    private apiHandle: SCORM2004Interface = null; // API SCORM

    /*******************************************************************************
     * Функция поиска SCORM API в текущем фрейме (window) и во всех
     * родительских (parent)
     * Параметры:  объект window
     * Возврвщает: объект SCORM API, если таковой нашелся, в противном случае null
     *******************************************************************************/
    private static findAPI(win: any): any {
        let findAPITries: number = 0;
        while (!("API_1484_11" in win) && win.parent && win.parent !== win) {
            findAPITries++;
            if (findAPITries > 100) {
                alert("Не удалось найти реализацию SCORM API.");
                return null;
            }
            win = win.parent;
        }
        return win["API_1484_11"];
    }

    /*******************************************************************************
     * Функция возвращает SCORM API, если таковой нашелся в текущем фрейме (window),
     * в каком либо из его родительских (parent), в окне opener, или его
     * родительских. В противном случае возвращается null.
     *******************************************************************************/
    private getAPI(): SCORM2004Interface {

        if (!this.apiHandle) {
            let theAPI = SCORMAPI.findAPI(window);
            if (!theAPI && window.opener && typeof(window.opener) !== "undefined") {
                theAPI = SCORMAPI.findAPI(window.opener);
            }
            if (!theAPI) {
                alert("Не удалось найти реализацию SCORM API.");
            } else {
                this.apiHandle = theAPI;
            }
        }
        return this.apiHandle;
    }

    /*******************************************************************************
     * Данная функция вызывается для инициализации сессии. Функция должна вызываться
     * до вызовов getDataValue, setDataValue, или terminate
     * Возврвщает: "true", если процесс инициализации прошел успешно, в противном
     *             случае - "false".
     *******************************************************************************/
    private initialize(): string {
        let result = "false";
        let api = this.getAPI();
        if (api) {
            result = api.Initialize("");
            if (result !== "true") {
                this.displayErrorInfo(this.getLastErrorCode());
            }
        }
        return result;
    }

    /*******************************************************************************
     * Данная функция вызывается для завершения сессии. После ее вызова нельзя
     * вызывать функции initialize, getDataValue или setDataValue
     * Возврвщает: "true", если прошло успешно, в противном случае - "false".
     *******************************************************************************/
    private terminate(): string {
        let result = "false";
        let api = this.getAPI();
        if (api) {
            result = api.Terminate("");
            if (result !== "true") {
                this.displayErrorInfo(this.getLastErrorCode());
            }
        }
        return result;
    }

    /*******************************************************************************
     * Функция запрашивает у Системы значение модели данных. Может вызываться после
     * вызова initialize, но до вызова terminate
     * Параметры:  название элемента модели данных (напр. "cmi.learner_id")
     * Возврвщает: значение запрашиваемых данных
     *******************************************************************************/
    private getDataValue(name: string): string {
        let result = "";
        let api = this.getAPI();
        if (api) {
            result = api.GetValue(name);
            let errCode = this.getLastErrorCode();
            if (errCode !== "0") {
                this.displayErrorInfo(errCode);
            }
        }
        return result;
    }

    /*******************************************************************************
     * Функция сохраняет значение в модели данных, определенное значением name.
     * Может вызываться после вызова initialize, но до вызова terminate.
     * Параметры:  name - название элемента модели данных
     *             value - сохраняемое значение
     * Возврвщает: "true" - если успешно, "false" - при ошибке.
     *******************************************************************************/
    private setDataValue(name: string, value: string): string {
        let result = "false";
        let api = this.getAPI();
        if (api) {
            value = SCORMAPI.encodeNewLine(value);
            result = api.SetValue(name, value);
            if (result !== "true") {
                this.displayErrorInfo(this.getLastErrorCode());
            }
        }
        return result;
    }

    /*******************************************************************************
     * Донная функция дает команду Системе на сохранение последних изменений.
     * Может вызываться после вызова initialize, но до вызова terminate.
     *******************************************************************************/
    private commitData(): string {
        let result: string = "false";
        let api = this.getAPI();
        if (api) {
            result = api.Commit("");
            if (result !== "true") {
                this.displayErrorInfo(this.getLastErrorCode());
            }
        }
        return result;
    }

    /*******************************************************************************
     * Функция возвращает код последней ошибки.
     * Возврвщает: строку с кодом ошибки (возвращает "0" - если не было ошибки).
     *******************************************************************************/
    private getLastErrorCode(): string {
        let api = this.getAPI();
        return (!api ? "" : api.GetLastError());
    }

    /*******************************************************************************
     * Вспомогательная функция для показа информации об ошибке (код ошибки, описание
     * и диагностическую информацию)
     * Параметры:  errCode - код ошибки
     *******************************************************************************/
    private displayErrorInfo(errCode: string): void {

        let errString: string;
        let errDiagnostic: string;

        let api = this.getAPI();
        if (api) {
            errString = api.GetErrorString(errCode);
            errDiagnostic = api.GetDiagnostic("");
        }
        console.error("ERROR: " + errCode + " - " + errString + "\n" + "DIAGNOSTIC: " + errDiagnostic);

    }

    private static encodeNewLine(str: string): string {
        return str.replace(/\r\n/g, "\n").replace(/\n\r/g, "\n").replace(/\r/g, "\n");
    }

}