import { AnyObject } from '@shared/common.interface';

export class ModalItem {
    component: modalComponentName;
    data: AnyObject;
    maximizeSize: boolean;
    reloadAfterClose?: boolean;
}

// ВАЖНО! Такой список есть в компоненте ModalComponent

export type modalComponentName =
    "book"
    | "file"
    | "alert"
    | "question"
    | "user"
    | "message";

export const modalComponentNames = {
    book: "book" as modalComponentName,
    file: "file" as modalComponentName,
    alert: "alert" as modalComponentName,
    question: "question" as modalComponentName,
    user: "user" as modalComponentName,
    message: "message" as modalComponentName,
};



