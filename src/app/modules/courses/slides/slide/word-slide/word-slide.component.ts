
import {Component, ElementRef, Input, OnChanges, OnDestroy, OnInit} from "@angular/core";
import {WordSlideDataInterface} from "../../../interface/data-interface/course-data.interface";
import {CourseDataProvider} from "../../../data/course-data.provider";
import {BROWSER} from "../../../tools/universal/browser";
import {LOCATION} from "../../../tools/universal/location";
import {LearningProvider} from "../../../learning/learning.provider";
import {ResInitDataInterface} from "../../../res";
import {SearchProvider} from "../../../search/search.provider";

@Component({
    selector: "word-slide",
    templateUrl: "word-slide.component.html",
    styleUrls: ["word-slide.component.scss"]
})

export class WordSlideComponent implements OnInit, OnDestroy, OnChanges {

    @Input() slide: WordSlideDataInterface; // Слайд

    url: string;
    oldWebkit: boolean = BROWSER.oldWebkit();

    constructor(private el: ElementRef, private lp: LearningProvider, private sh: SearchProvider) {
    }

    ngOnInit() {
    }

    ngOnChanges() {
        // Параметр rnd для старых Webkit
        this.url = CourseDataProvider.dataFolderPath() + this.slide.doc + "/index.html?rnd=" + LOCATION.rndAdd();
    }

    ngOnDestroy() {

    }

    onLoadFrame() {
        const frame = this.el.nativeElement.querySelector('iframe');
        if (frame && "contentWindow" in frame && frame.contentWindow && this.slide) {
            const initData: ResInitDataInterface = {
                courseData: this.lp.courseData,
                highlightWords: this.sh.highlightWords(),
                scrollPosition: this.lp.getScrollPosition(this.slide.uuid)
            };
            frame.contentWindow.postMessage(initData, "*");
        }
    }

}

