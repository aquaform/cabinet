export type QuestionZoomValue = "NONE" | "ON" | "OFF";

export const questionZoomValue = {
    NONE: "NONE" as QuestionZoomValue,
    ON: "ON" as QuestionZoomValue,
    OFF: "OFF" as QuestionZoomValue,
};

export class QuestionZoom {

    constructor() {
    }

    static switchValue(value: QuestionZoomValue): QuestionZoomValue {

        switch (value) {
            case questionZoomValue.ON:
                return questionZoomValue.OFF;
            case questionZoomValue.OFF:
                return questionZoomValue.ON;
            default:
                return  questionZoomValue.NONE;
        }

    }

}