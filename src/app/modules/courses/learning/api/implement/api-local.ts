/**
 * Created by Baranoshnikov on 12.05.2017.
 */

import {APIClassInterface} from "../api.interface";
import {ActivityInterface, LearningInterface} from "../../../interface/learning-interface/learning.interface";
import {Subject} from "rxjs";
import {StandardProcessingInterface} from "../../../tools/universal/processing";

export class LocalAPI implements APIClassInterface {

    public onLoad: Subject<LearningInterface>;
    public onError: Subject<string> = new Subject();

    constructor() {
        this.onLoad = new Subject();
        setTimeout(() => {
            this.onLoad.next(undefined);
        });
    }

    save(learningData: LearningInterface, activities: Array<ActivityInterface>, isTerminate: boolean, isUnload: boolean) {
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


}