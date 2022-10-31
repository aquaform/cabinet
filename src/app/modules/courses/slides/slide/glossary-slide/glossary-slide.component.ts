import {Component, ElementRef, HostBinding, Input, OnChanges, OnDestroy, OnInit} from "@angular/core";
import {BROWSER} from "../../../tools/universal/browser";
import {GlossarySlideDataInterface} from "../../../interface/data-interface/course-data.interface";
import {DOM} from "../../../tools/dom";

@Component({
    selector: "glossary-slide",
    templateUrl: "glossary-slide.component.html",
    styleUrls: ["glossary-slide.component.scss"]
})

export class GlossarySlideComponent implements OnInit, OnDestroy, OnChanges {

    @Input() slide: GlossarySlideDataInterface; // Слайд
    @HostBinding('class.oldWebkit') oldWebkit: boolean = false;

    constructor() {
        this.oldWebkit = BROWSER.oldWebkit();
    }

    ngOnInit() {
    }

    ngOnChanges() {
    }

    ngOnDestroy() {
    }

}

