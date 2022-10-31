import { ErrorInterface } from "../error/error.interface";
import { SlideDataInterface } from "../interface/data-interface/course-data.interface";
import { TermDataInterface } from "../interface/data-interface/slides/glossary-data.interface";

export type ModalTypes = "SLIDE" | "TERM" | "ERROR";

export const modalTypes = {
    SLIDE: "SLIDE" as ModalTypes,
    TERM: "TERM" as ModalTypes,
    ERROR: "ERROR" as ModalTypes
};

export interface ModalWindowSettings {
    maximizeSize?: boolean;
    hideCloseButton?: boolean;
    title?: string;
    closeByHost?: boolean;
}

export interface ModalInterface extends ModalWindowSettings {
    type: ModalTypes;
    slide?: SlideDataInterface;
    slideToRestoreAfterClose?: string;
    term?: TermDataInterface;
    error?: ErrorInterface;
}

export type ModalSlideCommands = "START" | "EXIT" | "NOTHING";

export const modalSlideCommands = {
    START: "START" as ModalSlideCommands,
    EXIT: "EXIT" as ModalSlideCommands,
    NOTHING: "NOTHING" as ModalSlideCommands,
};