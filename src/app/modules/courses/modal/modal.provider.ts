import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import { BehaviorSubject } from "rxjs";
import { ModalInterface } from "./modal.interface";



@Injectable({
    providedIn: 'root'
})
export class ModalProvider {

    onRoute: Subject<ModalInterface>; // Открытие слайда
    onOpenWindow: Subject<ModalInterface>; // Открытие модального окна
    onCloseWindow: Subject<ModalInterface>; // Закрытие модального окна
    onChange: Subject<ModalInterface>; // Смена содержимого в модальном окне
    isOpen: BehaviorSubject<boolean>;

    constructor() {

    }

    init(ngUnsubscribe: Subject<void>) {
        this.onRoute = new Subject();
        this.onOpenWindow = new Subject();
        this.onCloseWindow = new Subject(); // Вызывается из компонента
        this.onChange = new Subject(); // Вызывается из компонента
        this.isOpen = new BehaviorSubject(false);
    }

    open(modal: ModalInterface) {
        this.onRoute.next(modal);
        this.isOpen.next(true);
    }

    close(modal: ModalInterface) {
        this.onCloseWindow.next(modal);
        this.isOpen.next(false);
    }

}