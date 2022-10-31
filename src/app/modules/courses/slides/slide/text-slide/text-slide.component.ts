
import { Component, ElementRef, HostBinding, HostListener, Input, OnChanges, ViewChild } from "@angular/core";
import { TextSlideDataInterface } from "../../../interface/data-interface/course-data.interface";
import { CourseDataProvider } from "../../../data/course-data.provider";
import { DOM } from "../../../tools/dom";
import { LearningProvider } from "../../../learning/learning.provider";
import { BROWSER } from "../../../tools/universal/browser";
import { Terms } from "../../../tools/terms";
import { SearchProvider } from "../../../search/search.provider";
import { Highlight } from "../../../tools/highlight";
import { Scroll } from "../../../tools/universal/scroll";
import { takeUntil } from "rxjs/operators";
import { AppComponentTemplate } from "@shared/component.template";

@Component({
    selector: "text-slide",
    templateUrl: "text-slide.component.html",
    styleUrls: ["text-slide.component.scss"]
})

export class TextSlideComponent extends AppComponentTemplate implements OnChanges {

    @Input() slide: TextSlideDataInterface; // Слайд
    @ViewChild('htmlContainer', { static: true }) htmlContainer: ElementRef; // Контейнер для вставки HTML
    @HostBinding('class.oldWebkit') oldWebkit = false;

    constructor(private el: ElementRef, private lp: LearningProvider, private sh: SearchProvider) {
        super();
        this.oldWebkit = BROWSER.oldWebkit();
    }

    ngOnChanges() {
        DOM.setInnerHTML(this.htmlContainer, CourseDataProvider.getData(this.slide.text))
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                DOM.setImageSize(this.el);
                DOM.setResHref(this.el);
                Highlight.mark(this.htmlContainer.nativeElement, this.sh.highlightWords());
                Terms.makeLinks(this.htmlContainer.nativeElement);
                this.lp.processLinks(this.el);
                Scroll.scrollToElementPosition(this.el, this.lp.getScrollPosition(this.slide.uuid));
            });
    }

    ngOnDestroy() {
        this.lp.saveScrollPosition(this.slide.uuid, Scroll.getElementScrollPosition(this.el));
    }

    @HostListener('window:resize', ['$event'])
    onResize($event) {
        DOM.setImageSize(this.el);
    }

}

