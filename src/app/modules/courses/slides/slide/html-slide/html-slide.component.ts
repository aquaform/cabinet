import {Component, Input, OnChanges, OnDestroy, OnInit} from "@angular/core";
import {HTMLSlideDataInterface} from "../../../interface/data-interface/course-data.interface";
import {CourseDataProvider} from "../../../data/course-data.provider";
import {BROWSER} from "../../../tools/universal/browser";

@Component({
    selector: "html-slide",
    templateUrl: "html-slide.component.html",
    styleUrls: ["html-slide.component.scss"]
})

export class HTMLSlideComponent implements OnInit, OnDestroy, OnChanges {

    @Input() slide: HTMLSlideDataInterface; // Слайд

    url: string;
    oldWebkit: boolean = BROWSER.oldWebkit();

    constructor() {
    }

    ngOnInit() {
    }

    ngOnChanges() {
        this.url = CourseDataProvider.frameURL(this.slide.html);
    }

    ngOnDestroy() {
    }


}

