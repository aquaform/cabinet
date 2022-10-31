import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { StartSlideDataInterface } from "../../../interface/data-interface/course-data.interface";
import { DOM } from "../../../tools/dom";
import { CourseDataProvider } from "../../../data/course-data.provider";
import { LearningProvider } from "../../../learning/learning.provider";
import { BROWSER } from "../../../tools/universal/browser";
import { Terms } from "../../../tools/terms";
import { Highlight } from "../../../tools/highlight";
import { SearchProvider } from "../../../search/search.provider";
import { AppComponentTemplate } from "@shared/component.template";
import { modalSlideCommands, ModalSlideCommands } from "@modules/courses/modal/modal.interface";
import { DevicesTools } from "@modules/root/devices/devices.class";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "start-slide",
    templateUrl: "start-slide.component.html",
    styleUrls: ["start-slide.component.scss"]
})

export class StartSlideComponent extends AppComponentTemplate implements OnChanges {

    @Input() slide: StartSlideDataInterface; // Слайд
    @Input() isMain = true; // Это слайд в основном окне (не модальное)

    @Output() emitModalSlideCommand = new EventEmitter<ModalSlideCommands>();

    @ViewChild('htmlContainer', { static: true }) htmlContainer: ElementRef; // Контейнер для вставки HTML
    @HostBinding('class.oldWebkit') oldWebkit = false;
    title: string = CourseDataProvider.courseTitle();

    constructor(
        private el: ElementRef,
        private lp: LearningProvider,
        private sh: SearchProvider,
    ) {
        super();
        this.oldWebkit = BROWSER.oldWebkit();
    }

    ngOnChanges() {
        DOM.setInnerHTML(this.htmlContainer, CourseDataProvider.getData(this.slide.text)).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
            DOM.setImageSize(this.el);
            DOM.setResHref(this.el);
            Highlight.mark(this.htmlContainer.nativeElement, this.sh.highlightWords());
            Terms.makeLinks(this.htmlContainer.nativeElement);
            this.lp.processLinks(this.el);
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize($event) {
        DOM.setImageSize(this.el);
    }

    start(): void {
        if (DevicesTools.isMobile()) {
            this.emitModalSlideCommand.emit(modalSlideCommands.NOTHING);
            setTimeout(() => {
                this.lp.onChangeTocVisibility.next(true);
            }, 50);
        } else {
            this.emitModalSlideCommand.emit(modalSlideCommands.START);
        }

    }

    exit(): false {
        this.emitModalSlideCommand.emit(modalSlideCommands.EXIT);
        return false;
    }

}

