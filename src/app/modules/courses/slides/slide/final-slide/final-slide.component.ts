import {
    Component, ElementRef, HostBinding, HostListener, Input, OnChanges, OnDestroy, OnInit,
    ViewChild
} from "@angular/core";
import {FinalSlideDataInterface} from "../../../interface/data-interface/course-data.interface";
import {DOM} from "../../../tools/dom";
import {CourseDataProvider} from "../../../data/course-data.provider";
import {SlideProvider} from "../slide.provider";
import {LearningProvider} from "../../../learning/learning.provider";
import {BROWSER} from "../../../tools/universal/browser";
import {Terms} from "../../../tools/terms";
import {Highlight} from "../../../tools/highlight";
import {SearchProvider} from "../../../search/search.provider";
import { takeUntil } from "rxjs/operators";
import { AppComponentTemplate } from "@shared/component.template";

@Component({
    selector: "final-slide",
    templateUrl: "final-slide.component.html",
    styleUrls: ["final-slide.component.scss"]
})

export class FinalSlideComponent extends AppComponentTemplate implements OnInit, OnDestroy, OnChanges {

    @Input() slide: FinalSlideDataInterface; // Слайд
    @ViewChild('htmlContainer', { static: true }) htmlContainer: ElementRef; // Контейнер для вставки HTML

    @HostBinding('class.oldWebkit') oldWebkit: boolean = false;

    constructor(private el: ElementRef, private lp: LearningProvider, private sh: SearchProvider) {
        super();
        this.oldWebkit = BROWSER.oldWebkit();
    }

    ngOnInit() {
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

    ngOnDestroy() {

    }

    @HostListener('window:resize', ['$event'])
    onResize($event) {
        DOM.setImageSize(this.el);
    }

}

