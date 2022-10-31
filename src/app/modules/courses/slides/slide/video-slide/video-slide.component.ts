
import {
    Component, ElementRef, HostBinding, HostListener, Input, OnChanges, OnDestroy, OnInit,
    ViewChild
} from "@angular/core";
import { VideoSlideDataInterface } from "../../../interface/data-interface/course-data.interface";
import { DOM } from "../../../tools/dom";
import { CourseDataProvider } from "../../../data/course-data.provider";
import { VideoFormatDataInterface } from "../../../interface/data-interface/slides/video-data.interface";
import { LearningProvider } from "../../../learning/learning.provider";
import { BROWSER } from "../../../tools/universal/browser";
import { Terms } from "../../../tools/terms";
import { SearchProvider } from "../../../search/search.provider";
import { Highlight } from "../../../tools/highlight";
import { takeUntil } from "rxjs/operators";
import { AppComponentTemplate } from "@shared/component.template";

@Component({
    selector: "video-slide",
    templateUrl: "video-slide.component.html",
    styleUrls: ["video-slide.component.scss"]
})

export class VideoSlideComponent extends AppComponentTemplate implements OnInit, OnDestroy, OnChanges {

    path: string;
    @Input() slide: VideoSlideDataInterface; // Слайд
    defaultWidth: string;

    @ViewChild('htmlDescription', { static: true }) htmlDescriptionRef: ElementRef; // Контейнер для вставки комментария в формате HTML
    htmlDescription: string;
    @HostBinding('class.singleVideo') isSingleVideo = false;
    @HostBinding('class.withDescription') isDescription = false;
    @HostBinding('class.oldWebkit') oldWebkit = false;

    constructor(private el: ElementRef, private lp: LearningProvider, private sh: SearchProvider) {
        super();
        this.path = CourseDataProvider.dataFolderPath();
        this.oldWebkit = BROWSER.oldWebkit();
    }

    ngOnChanges() {
        if ("description" in this.slide.video) {
            this.htmlDescription = CourseDataProvider.getData(this.slide.video.description);
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
            this.isSingleVideo = true;
        }
        if (this.isDescription) {
            this.defaultWidth = "100%";
        } else {
            this.defaultWidth = "auto";
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

    url(source: VideoFormatDataInterface) {

        if (this.slide.video.isExternal) {
            return source.file;
        } else {
            return this.path + source.file;
        }
    }

}

