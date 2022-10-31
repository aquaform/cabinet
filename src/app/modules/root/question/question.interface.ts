
export type QuestionAnswer = "yes" | "no" | "cancel";

export const questionAnswers = {
    yes: "yes" as QuestionAnswer,
    no: "no" as QuestionAnswer,
    cancel: "cancel" as QuestionAnswer
};

export class QuestionData {
    text: string;
}
