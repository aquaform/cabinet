export type ErrorCodes = "UNKNOWN" | "SLIDE_IS_DISABLED" | "SLIDE_NOT_FOUND" | "LINKS_IN_INTERACTIVE_SLIDE" | "LEARNING_COMMIT_ERROR";

export const errorCodes = {
    UNKNOWN: "UNKNOWN" as ErrorCodes,
    SLIDE_IS_DISABLED: "SLIDE_IS_DISABLED" as ErrorCodes,
    SLIDE_NOT_FOUND: "SLIDE_NOT_FOUND" as ErrorCodes,
    LINKS_IN_INTERACTIVE_SLIDE: "LINKS_IN_INTERACTIVE_SLIDE" as ErrorCodes,
    LEARNING_COMMIT_ERROR: "LEARNING_COMMIT_ERROR" as ErrorCodes
};

export interface ErrorInterface {
    code: ErrorCodes,
    params?: string[],
    console?: string
}