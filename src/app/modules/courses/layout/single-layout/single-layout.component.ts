
import { Component } from "@angular/core";
import { environment } from "@environments/environment";
import { CourseDataProvider } from "@modules/courses/data/course-data.provider";
import { CloseButtonsPosition, closeButtonsPositions } from "@modules/courses/interface/data-interface/course-data.interface";
import { navPositions, navTypes } from "@modules/courses/nav/nav.interface";
import { BROWSER } from "@modules/courses/tools/universal/browser";
import { AppComponentTemplate } from "@shared/component.template";
import { BehaviorSubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "single-layout",
    templateUrl: "single-layout.component.html",
    styleUrls: ["single-layout.component.scss"]
})

export class SingleLayoutComponent extends AppComponentTemplate {

    navTypes = navTypes;
    navPositions = navPositions;
    closeButtonsPositions = closeButtonsPositions;
    closeButtonsPosition: CloseButtonsPosition = CourseDataProvider.closeButtonPosition();
    oldWebkit = BROWSER.oldWebkit();

    private idleTimer: NodeJS.Timer;
    private events: string[] = ['mousemove', 'scroll', 'keypress', 'mousedown', 'touchstart']; // https://stackoverflow.com/a/24989958
    private useCaptureEvents: string[] = ['scroll']; // https://stackoverflow.com/a/32954565
    private idleTime: number = 3;
    private detectActivity$ = new Subject<boolean>();

    visibilityFlyingCloseButton$: BehaviorSubject<boolean> = new BehaviorSubject(this.displayFlyingCloseButton());

    constructor() {
        super();
    }

    ngOnInit() {
        if (this.isIdleButton()) {
            this.initIdle();
        }
    }

    displayNavBar(): boolean {
        return this.closeButtonsPosition === closeButtonsPositions.auto;
    }

    isIdleButton(): boolean {
        if (this.closeButtonsPosition === closeButtonsPositions.left) {
            return true;
        }
        if (this.closeButtonsPosition === closeButtonsPositions.right) {
            return true;
        }
        return false;
    }

    private displayFlyingCloseButton(): boolean {
        if (this.closeButtonsPosition === closeButtonsPositions.left) {
            return true;
        }
        if (this.closeButtonsPosition === closeButtonsPositions.leftFix) {
            return true;
        }
        if (this.closeButtonsPosition === closeButtonsPositions.right) {
            return true;
        }
        if (this.closeButtonsPosition === closeButtonsPositions.rightFix) {
            return true;
        }
        return false;
    }

    initIdle() {

        if (environment.displayLog) {
            console.log("Start init idle flying close button");
        }

        this.destroyIdle();

        for (const eventName of this.events) {
            window.addEventListener(
                eventName,
                () => this.detectActivity$.next(true),
                this.useCaptureEvents.indexOf(eventName) > -1);
        }

        this.detectActivity$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                () => this.setIdle(true)
            );

        this.setIdle(true);

    }

    setIdle(value: boolean) {
        this.visibilityFlyingCloseButton$.next(value);
        this.destroyIdle();
        if (value) {
            this.idleTimer = setTimeout(() => {
                this.setIdle(false);
            }, this.idleTime * 1000);
        }
    }

    destroyIdle() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
    }

    ngOnDestroy() {
        this.destroyIdle();
    }

}

