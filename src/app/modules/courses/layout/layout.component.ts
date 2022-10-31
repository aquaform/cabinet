import { Component } from "@angular/core";
import { CourseDataInterface } from "../interface/data-interface/course-data.interface";
import { LayoutTypes, layoutTypes } from "./layout.interface";
import { TocNavTools } from "../nav/toc-nav/toc-nav.tools";
import { SlideProvider } from "../slides/slide/slide.provider";
import { ModalProvider } from "../modal/modal.provider";
import { ModalInterface } from "../modal/modal.interface";
import { AppComponentTemplate } from "@shared/component.template";
import { takeUntil } from "rxjs/operators";

declare let courseData: CourseDataInterface; // global var

@Component({
    selector: "layout",
    templateUrl: "layout.component.html",
    styleUrls: ["layout.component.scss"]
})

export class LayoutComponent extends AppComponentTemplate {

    type: LayoutTypes;
    types = layoutTypes;
    modalData: ModalInterface;

    constructor(private mp: ModalProvider) {
        super();
    }

    ngOnInit() {

        if (SlideProvider.isSingleSlide()) {
            this.type = layoutTypes.SINGLE;
        } else {
            if (TocNavTools.tocAvailable()) {
                this.type = layoutTypes.TOC;
            } else {
                this.type = layoutTypes.SLIDES;
            }
        }

        this.mp.onRoute
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((modal: ModalInterface) => {
                if (!this.modalData) {
                    this.mp.onOpenWindow.next(modal);
                }
                this.modalData = undefined;
                setTimeout(() => {
                    this.modalData = modal;
                    this.mp.onChange.next(modal);
                });
            });

        this.mp.onCloseWindow
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                this.modalData = undefined;
            });

    }

}

