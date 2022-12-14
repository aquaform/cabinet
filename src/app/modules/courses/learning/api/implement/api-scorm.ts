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

        this.setDataValue("cmi.exit", "suspend"); // ???????????? ???????? ??????????????
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
     * ?????????????? ???????????? SCORM API ?? ?????????????? ???????????? (window) ?? ???? ????????
     * ???????????????????????? (parent)
     * ??????????????????:  ???????????? window
     * ????????????????????: ???????????? SCORM API, ???????? ?????????????? ??????????????, ?? ?????????????????? ???????????? null
     *******************************************************************************/
    private static findAPI(win: any): any {
        let findAPITries: number = 0;
        while (!("API_1484_11" in win) && win.parent && win.parent !== win) {
            findAPITries++;
            if (findAPITries > 100) {
                alert("???? ?????????????? ?????????? ???????????????????? SCORM API.");
                return null;
            }
            win = win.parent;
        }
        return win["API_1484_11"];
    }

    /*******************************************************************************
     * ?????????????? ???????????????????? SCORM API, ???????? ?????????????? ?????????????? ?? ?????????????? ???????????? (window),
     * ?? ?????????? ???????? ???? ?????? ???????????????????????? (parent), ?? ???????? opener, ?????? ??????
     * ????????????????????????. ?? ?????????????????? ???????????? ???????????????????????? null.
     *******************************************************************************/
    private getAPI(): SCORM2004Interface {

        if (!this.apiHandle) {
            let theAPI = SCORMAPI.findAPI(window);
            if (!theAPI && window.opener && typeof(window.opener) !== "undefined") {
                theAPI = SCORMAPI.findAPI(window.opener);
            }
            if (!theAPI) {
                alert("???? ?????????????? ?????????? ???????????????????? SCORM API.");
            } else {
                this.apiHandle = theAPI;
            }
        }
        return this.apiHandle;
    }

    /*******************************************************************************
     * ???????????? ?????????????? ???????????????????? ?????? ?????????????????????????? ????????????. ?????????????? ???????????? ????????????????????
     * ???? ?????????????? getDataValue, setDataValue, ?????? terminate
     * ????????????????????: "true", ???????? ?????????????? ?????????????????????????? ???????????? ??????????????, ?? ??????????????????
     *             ???????????? - "false".
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
     * ???????????? ?????????????? ???????????????????? ?????? ???????????????????? ????????????. ?????????? ???? ???????????? ????????????
     * ???????????????? ?????????????? initialize, getDataValue ?????? setDataValue
     * ????????????????????: "true", ???????? ???????????? ??????????????, ?? ?????????????????? ???????????? - "false".
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
     * ?????????????? ?????????????????????? ?? ?????????????? ???????????????? ???????????? ????????????. ?????????? ???????????????????? ??????????
     * ???????????? initialize, ???? ???? ???????????? terminate
     * ??????????????????:  ???????????????? ???????????????? ???????????? ???????????? (????????. "cmi.learner_id")
     * ????????????????????: ???????????????? ?????????????????????????? ????????????
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
     * ?????????????? ?????????????????? ???????????????? ?? ???????????? ????????????, ???????????????????????? ?????????????????? name.
     * ?????????? ???????????????????? ?????????? ???????????? initialize, ???? ???? ???????????? terminate.
     * ??????????????????:  name - ???????????????? ???????????????? ???????????? ????????????
     *             value - ?????????????????????? ????????????????
     * ????????????????????: "true" - ???????? ??????????????, "false" - ?????? ????????????.
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
     * ???????????? ?????????????? ???????? ?????????????? ?????????????? ???? ???????????????????? ?????????????????? ??????????????????.
     * ?????????? ???????????????????? ?????????? ???????????? initialize, ???? ???? ???????????? terminate.
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
     * ?????????????? ???????????????????? ?????? ?????????????????? ????????????.
     * ????????????????????: ???????????? ?? ?????????? ???????????? (???????????????????? "0" - ???????? ???? ???????? ????????????).
     *******************************************************************************/
    private getLastErrorCode(): string {
        let api = this.getAPI();
        return (!api ? "" : api.GetLastError());
    }

    /*******************************************************************************
     * ?????????????????????????????? ?????????????? ?????? ???????????? ???????????????????? ???? ???????????? (?????? ????????????, ????????????????
     * ?? ?????????????????????????????? ????????????????????)
     * ??????????????????:  errCode - ?????? ????????????
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