import {
    Component, ElementRef, HostBinding, HostListener, Input, OnChanges, OnDestroy, OnInit,
    ViewChild
} from "@angular/core";
import {TermDataInterface} from "../../../interface/data-interface/slides/glossary-data.interface";
import {BROWSER} from "../../../tools/universal/browser";
import {CourseDataProvider} from "../../../data/course-data.provider";
import {DOM} from "../../../tools/dom";
import {LearningProvider} from "../../../learning/learning.provider";
import { takeUntil } from "rxjs/operators";
import { AppComponentTemplate } from "@shared/component.template";

@Component({
    selector: "term",
    templateUrl: "term.component.html",
    styleUrls: ["term.component.scss"]
})

export class TermComponent extends AppComponentTemplate implements OnInit, OnDestroy, OnChanges {

    @Input() term: TermDataInterface;
    @ViewChild('htmlContainer', { static: true }) htmlContainer: ElementRef; // Контейнер для вставки HTML
    @HostBinding('class.oldWebkit') oldWebkit: boolean = false;

    constructor(private el: ElementRef, private lp: LearningProvider) {
        super();
        this.oldWebkit = BROWSER.oldWebkit();
    }

    ngOnInit() {


    }

    ngOnChanges() {
        DOM.setInnerHTML(this.htmlContainer, CourseDataProvider.getData(this.term.description)).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
            DOM.setImageSize(this.el);
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

