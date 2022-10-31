import {
    Component, ElementRef, HostBinding, HostListener, Input, OnChanges, OnDestroy, OnInit,
    ViewChild
} from "@angular/core";
import {ArchiveSlideDataInterface} from "../../../interface/data-interface/course-data.interface";
import {DOM} from "../../../tools/dom";
import {CourseDataProvider} from "../../../data/course-data.provider";
import {LearningProvider} from "../../../learning/learning.provider";
import {FILE} from "../../../tools/universal/file";
import {BROWSER} from "../../../tools/universal/browser";
import {Terms} from "../../../tools/terms";
import {Highlight} from "../../../tools/highlight";
import {SearchProvider} from "../../../search/search.provider";
import { APIProvider } from "../../../learning/api/api.provider";
import { takeUntil } from "rxjs/operators";
import { AppComponentTemplate } from "@shared/component.template";

@Component({
    selector: "archive-slide",
    templateUrl: "archive-slide.component.html",
    styleUrls: ["archive-slide.component.scss"]
})

export class ArchiveSlideComponent extends AppComponentTemplate implements OnInit, OnDestroy, OnChanges {

    @Input() slide: ArchiveSlideDataInterface;
    archiveURI: string;

    @ViewChild('htmlDescription', { static: true }) htmlDescriptionRef: ElementRef; // Контейнер для вставки комментария в формате HTML
    htmlDescription: string;
    @HostBinding('class.singleElement') isSingleElement: boolean = false;
    @HostBinding('class.withDescription') isDescription: boolean = false;
    @HostBinding('class.oldWebkit') oldWebkit: boolean = false;

    constructor(private el: ElementRef, private lp: LearningProvider, private sh: SearchProvider, private api: APIProvider) {
        super();
        this.oldWebkit = BROWSER.oldWebkit();
    }

    ngOnChanges() {
        this.archiveURI = CourseDataProvider.dataFolderPath() + this.slide.archive.path;
        if ("description" in this.slide.archive) {
            this.htmlDescription = CourseDataProvider.getData(this.slide.archive.description);
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
            this.isSingleElement = true;
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

    download() {
       FILE.download(this.archiveURI, this.api);
    }

}