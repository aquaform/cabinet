import {APIClassInterface} from "../api.interface";
import {ActivityInterface, LearningInterface} from "../../../interface/learning-interface/learning.interface";
import {Subject} from "rxjs";
import {StandardProcessingInterface} from "../../../tools/universal/processing";
import {CourseSettingsProvider} from "../../../settings/settings.provider";
import {apiModes} from "../../../settings/settings.interface";

declare let learningData: LearningInterface; // global var

export class V8API implements APIClassInterface {

    public onLoad: Subject<LearningInterface> = new Subject();
    public onError: Subject<string> = new Subject();

    private exchangeForm: HTMLElement;
    private editorMode = false;
    private supportFileDownload = false;

    constructor() {
        this.createExchangeElement();
        setTimeout(() => {
            if ('learningData' in window) {
                this.onLoad.next(learningData);
            } else {
                this.onLoad.next(undefined);
            }
        });

        this.editorMode = (CourseSettingsProvider.get("api.mode") === apiModes.editor);
        this.supportFileDownload = !!CourseSettingsProvider.get("api.supportFileDownload");

    }

    save(currentLearningData: LearningInterface, activities: Array<ActivityInterface>, isTerminate: boolean, isUnload: boolean) {

        const dataElement = document.getElementById("v8ExchangeData");
        dataElement.innerText = JSON.stringify(currentLearningData);
        dataElement.click(); // Вызываем обработчик в форме 1С

    }

    closeCommandIsAvailable() {
        return false;
    }

    historyCommandsIsAvailable() {
        return true;
    }

    beforeOpenSlide(uuidSlide: string,  standardProcessing: StandardProcessingInterface) {
        if (this.editorMode) {
            standardProcessing.standard = false;
            const dataElement = document.getElementById("v8OpenItem");
            dataElement.innerText = uuidSlide;
            dataElement.click(); // Вызываем обработчик в форме 1С
        }
    }

    downloadFile(sURL: string, standardProcessing: StandardProcessingInterface) {
        if (this.supportFileDownload) {
            standardProcessing.standard = false;
            const dataElement = document.getElementById("v8DownloadFile");
            dataElement.innerText = sURL;
            dataElement.click(); // Вызываем обработчик в форме 1С
        }
    }

    private createExchangeElement() {

        if (this.exchangeForm) {
            return;
        }

        this.exchangeForm = document.createElement("form");
        this.exchangeForm.setAttribute("name", "v8Exchange");
        this.exchangeForm.setAttribute("style", "display: none;");
        this.exchangeForm.innerHTML = `
            <textarea name="data" id="v8ExchangeData"></textarea>
            <textarea name="data" id="v8OpenItem"></textarea>
            <textarea name="data" id="v8DownloadFile"></textarea>
        `;

        document.body.appendChild(this.exchangeForm);

    }



}