import {
    Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, HostBinding
} from "@angular/core";
import { PDFSlideDataInterface } from "../../../interface/data-interface/course-data.interface";
import { DOM } from "../../../tools/dom";
import { CourseDataProvider } from "../../../data/course-data.provider";
import { CourseSettingsProvider } from "../../../settings/settings.provider";
import { FILE } from "../../../tools/universal/file";
import { APIProvider } from "../../../learning/api/api.provider";
import { BROWSER } from "../../../tools/universal/browser";

@Component({
    selector: "pdf-slide",
    templateUrl: "pdf-slide.component.html",
    styleUrls: ["pdf-slide.component.scss"]
})

export class PDFSlideComponent implements OnInit, OnDestroy, OnChanges {

    @Input() slide: PDFSlideDataInterface;
    frameURI: string;
    @HostBinding('class.downloadPDF') downloadPDF = false;
    @HostBinding('class.oldWebkit') oldWebkit = false;

    constructor(private el: ElementRef, private api: APIProvider) {
        this.downloadPDF = !!CourseSettingsProvider.get("downloadPDF");
        this.oldWebkit = BROWSER.oldWebkit();
    }

    ngOnChanges() {
        this.frameURI = CourseDataProvider.dataFolderPath() + this.slide.pdf.path;
    }

    ngOnInit() {
        DOM.setWidthIFrameInOldWebkit(this.el);
    }

    ngOnDestroy() {
    }

    @HostListener('window:resize', ['$event'])
    onResize($event) {
        DOM.setWidthIFrameInOldWebkit(this.el);
    }

    download() {
        FILE.download(this.frameURI, this.api);
    }

}

