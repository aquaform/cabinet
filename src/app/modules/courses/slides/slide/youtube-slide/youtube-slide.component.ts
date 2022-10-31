import {
    Component, ElementRef, HostBinding, HostListener, Input, OnChanges, OnDestroy, OnInit,
    ViewChild
} from "@angular/core";
import {YouTubeSlideDataInterface} from "../../../interface/data-interface/course-data.interface";
import {DOM} from "../../../tools/dom";
import {CourseDataProvider} from "../../../data/course-data.provider";
import {SlideProvider} from "../slide.provider";
import {LearningProvider} from "../../../learning/learning.provider";
import {BROWSER} from "../../../tools/universal/browser";
import {Terms} from "../../../tools/terms";
import {Highlight} from "../../../tools/highlight";
import {SearchProvider} from "../../../search/search.provider";
import { YoutubeTools } from '@modules/root/youtube/youtube.class';
import { takeUntil } from "rxjs/operators";
import { AppComponentTemplate } from "@shared/component.template";

@Component({
    selector: "youtube-slide",
    templateUrl: "youtube-slide.component.html",
    styleUrls: ["youtube-slide.component.scss"]
})

export class YouTubeSlideComponent extends AppComponentTemplate implements OnInit, OnDestroy, OnChanges {

    @Input() slide: YouTubeSlideDataInterface; // Слайд
    height: string = "100%";

    @ViewChild('htmlDescription', { static: true }) htmlDescriptionRef: ElementRef; // Контейнер для вставки комментария в формате HTML
    htmlDescription: string;
    @HostBinding('class.singleVideo') isSingleVideo: boolean = false;
    @HostBinding('class.withDescription') isDescription: boolean = false;
    @HostBinding('class.oldWebkit') oldWebkit: boolean = false;

    constructor(private el: ElementRef, private lp: LearningProvider, private sh: SearchProvider) {
        super();
        this.oldWebkit = BROWSER.oldWebkit();
    }

    ngOnChanges() {
        if ("description" in this.slide.youtube) {
            this.htmlDescription = CourseDataProvider.getData(this.slide.youtube.description);
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
    }

    ngOnInit() {

        // Устанавливаем недостающие свойства

        if (this.isDescription) {
            this.height = "85%";
        }

        DOM.setWidthIFrameInOldWebkit(this.el);

    }

    ngOnDestroy() {
    }

    videoURL() {
        const autoplay = ('autoplay' in this.slide.youtube) ? this.slide.youtube.autoplay : false;
        return YoutubeTools.videoURL(this.slide.youtube.id, autoplay);
    }

    @HostListener('window:resize', ['$event'])
    onResize($event) {
        DOM.setImageSize(this.el);
        DOM.setWidthIFrameInOldWebkit(this.el);
    }



}

