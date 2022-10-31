
import {
    Component, ElementRef, HostBinding, HostListener, Input, OnChanges, OnDestroy, OnInit,
    ViewChild
} from "@angular/core";
import {AudioSlideDataInterface} from "../../../interface/data-interface/course-data.interface";
import {DOM} from "../../../tools/dom";
import {CourseDataProvider} from "../../../data/course-data.provider";
import {LearningProvider} from "../../../learning/learning.provider";
import {BROWSER} from "../../../tools/universal/browser";
import {Terms} from "../../../tools/terms";
import {Highlight} from "../../../tools/highlight";
import {SearchProvider} from "../../../search/search.provider";
import { takeUntil } from "rxjs/operators";
import { AppComponentTemplate } from "@shared/component.template";

@Component({
    selector: "audio-slide",
    templateUrl: "audio-slide.component.html",
    styleUrls: ["audio-slide.component.scss"]
})

export class AudioSlideComponent extends AppComponentTemplate implements OnInit, OnDestroy, OnChanges {

    path: string;
    oldIE: boolean;
    @Input() slide: AudioSlideDataInterface; // Слайд

    @ViewChild('htmlDescription', { static: true }) htmlDescriptionRef: ElementRef; // Контейнер для вставки комментария в формате HTML
    htmlDescription: string;
    @HostBinding('class.singleAudio') isSingleAudio: boolean = false;
    @HostBinding('class.withDescription') isDescription: boolean = false;
    @HostBinding('class.oldWebkit') oldWebkit: boolean = false;

    constructor(private el: ElementRef, private lp: LearningProvider, private sh: SearchProvider) {
        super();
        this.path = CourseDataProvider.dataFolderPath();
        this.oldIE = BROWSER.oldIE();
        this.oldWebkit = BROWSER.oldWebkit();
    }

    ngOnChanges() {
        if ("description" in this.slide.audio) {
            this.htmlDescription = CourseDataProvider.getData(this.slide.audio.description);
        }
        if (this.htmlDescription) {
            this.isDescription = true;
            DOM.setInnerHTML(this.htmlDescriptionRef, this.htmlDescription).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
                DOM.setImageSize(this.el);
                Highlight.mark(this.htmlDescriptionRef.nativeElement, this.sh.highlightWords());
                Terms.makeLinks(this.htmlDescriptionRef.nativeElement);
                this.lp.processLinks(this.el);
            });
        } else {
            this.isSingleAudio = true;
        }
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    @HostListener('window:resize', ['$event'])
    onResize($event) {
        DOM.setImageSize(this.el);
    }

}

