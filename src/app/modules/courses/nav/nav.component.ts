import { Component, ElementRef, HostListener, Input } from "@angular/core";
import { NavPosition, navPositions, NavTypes, navTypes } from "./nav.interface";
import { DOM } from "../tools/dom";
import { AlertProvider } from "../alert/alert.provider";
import { SlideProvider } from '../slides/slide/slide.provider';
import { CourseDataProvider } from '../data/course-data.provider';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';
import { LearningProvider } from '../learning/learning.provider';


@Component({
    selector: "app-course-nav",
    templateUrl: "nav.component.html",
    styleUrls: ["nav.component.scss"]
})

export class NavCourseComponent extends AppComponentTemplate {

    @Input() position: NavPosition;
    @Input() type: NavTypes;

    bookmarksCommandIsAvailable: boolean = this.lp.bookmarksCommandIsAvailable();
    bookmarksCheckIsAvailable = false;

    types = navTypes;
    navPositions = navPositions;

    constructor(
        private el: ElementRef,
        private alert: AlertProvider,
        private sp: SlideProvider,
        private lp: LearningProvider) {

        super();

    }

    ngOnInit() {

        setTimeout(() => {
            this.setElementHeight();
        });

        this.alert.onChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
            setTimeout(() => {
                this.setElementHeight();
            });
        });

        // Подписываемся на изменение текущего слайда

        this.sp.onChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(slide => {
            if (slide) {
                if (CourseDataProvider.findTocElement(slide.uuid)) {
                    this.bookmarksCheckIsAvailable = this.bookmarksCommandIsAvailable;
                } else {
                    this.bookmarksCheckIsAvailable = false;
                }
            } else {
                this.bookmarksCheckIsAvailable = false;
            }
        });

    }

    @HostListener('window:resize', ['$event'])
    onResize($event) {
        this.setElementHeight();
    }

    private setElementHeight() {
        if (this.type === navTypes.TOC || this.type === navTypes.SEARCH || this.type === navTypes.BOOKMARKS) {
            DOM.setHeightForOldWebKit(this.el);
        }
    }


}

