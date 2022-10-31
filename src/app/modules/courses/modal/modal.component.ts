import {Component, HostListener, Input} from "@angular/core";
import { AppComponentTemplate } from "@shared/component.template";
import { LearningProvider } from "../learning/learning.provider";
import { SlideProvider } from "../slides/slide/slide.provider";
import { ModalInterface, modalSlideCommands, ModalSlideCommands, modalTypes } from "./modal.interface";
import { ModalProvider } from "./modal.provider";

const selectorName = 'app-course-modal';

@Component({
    selector: selectorName,
    templateUrl: "modal.component.html",
    styleUrls: ["modal.component.scss"]
})

export class ModalComponent extends AppComponentTemplate {

    @Input() data: ModalInterface;

    modalTypes = modalTypes;
    startClickTarget: EventTarget;

    @HostListener("mousedown", ['$event'])
    mousedown(event: MouseEvent) {
      // Если элемент, где начали нажатие не совпадет
      // с тем, на котором его завершили, то такое событие обрабатывать не следует.
      this.startClickTarget = event.target;
    }

    @HostListener("click", ['$event'])
    hostClick(event: MouseEvent) {
      if (this.data.closeByHost && this.startClickTarget === event.target
        && event.target instanceof Element && event.target.localName === selectorName) {
        this.close();
      }
    }

    constructor(private mp: ModalProvider, private lp: LearningProvider) {
        super();
    }

    close(): false {
        this.mp.close(this.data);
        return false;
    }

    doSlideCommand(command: ModalSlideCommands) {
        if (command === modalSlideCommands.EXIT) {
            this.lp.close();
        }
        if (command === modalSlideCommands.START) {
            this.close();
            const firstSlide = SlideProvider.first();
            if (firstSlide) {
                this.lp.goToSlide(firstSlide.uuid);
            }
        }
        if (command === modalSlideCommands.NOTHING) {
            this.close();
        }
    }

}