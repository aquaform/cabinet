/**
 * Created by Baranoshnikov on 12.05.2017.
 */

import {ActivityInterface, LearningInterface} from "../../interface/learning-interface/learning.interface";
import {Subject} from "rxjs";
import {StandardProcessingInterface} from "../../tools/universal/processing";

export interface APIClassInterface {

    onLoad: Subject<LearningInterface>;
    onError: Subject<string>;

    closeCommandIsAvailable(): boolean; // Доступна команда закрытия курса
    historyCommandsIsAvailable(): boolean; // Доступны команды перехода а по истории браузера

    save(learningData: LearningInterface, activities: Array<ActivityInterface>, isTerminate: boolean, isUnload: boolean): void;
    beforeOpenSlide(uuidSlide: string,  standardProcessing: StandardProcessingInterface): void;
    downloadFile(sURL: string,  standardProcessing: StandardProcessingInterface): void;

}