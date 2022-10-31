import {Component, Input, OnChanges, OnDestroy, OnInit} from "@angular/core";
import {DOM} from "../../../tools/dom";
import {ImageSlideDataInterface} from "../../../interface/data-interface/course-data.interface";
import {CourseDataProvider} from "../../../data/course-data.provider";
import {BROWSER} from "../../../tools/universal/browser";
import {LOCATION} from "../../../tools/universal/location";

@Component({
    selector: "image-slide",
    templateUrl: "image-slide.component.html",
    styleUrls: ["image-slide.component.scss"]
})

export class ImageSlideComponent implements OnInit, OnDestroy, OnChanges {

    path: string;
    oldWebkit: boolean;
    @Input() slide: ImageSlideDataInterface; // Слайд
    rndAdd: string;

    constructor() {
        this.path = CourseDataProvider.dataFolderPath();
        this.oldWebkit = BROWSER.oldWebkit();
        this.rndAdd = LOCATION.rndAdd();
    }

    ngOnInit() {
    }

    ngOnChanges() {
    }

    ngOnDestroy() {
    }

}

