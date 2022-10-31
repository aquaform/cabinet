import { Component, ElementRef, HostListener } from "@angular/core";
import { navPositions, NavTypes, navTypes } from "../../nav/nav.interface";
import { BROWSER } from "../../tools/universal/browser";
import { LearningProvider } from "../../learning/learning.provider";
import { animate, style, transition, trigger } from "@angular/animations";
import { WINDOW } from "../../tools/universal/window";
import { AppComponentTemplate } from "@shared/component.template";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "app-toc-layout",
    templateUrl: "toc-layout.component.html",
    styleUrls: ["toc-layout.component.scss"],
    animations: [
        trigger('onMove', [
            transition('void => animate', [
                style({ transform: 'translateX(-100%)' }),
                animate(200)
            ]),
            transition('animate => void', [
                animate(200, style({ transform: 'translateX(-100%)' }))
            ])

        ])
    ]
})

export class TocLayoutComponent extends AppComponentTemplate {

    navTypes = navTypes;
    tocVisibility = true;
    doTocAnimation: string;
    curNavType: NavTypes;
    navPositions = navPositions;

    private navWidth: number; // Ширина дерева содержания до начала изменения его размера
    private navElement: HTMLElement; // Элемент DOM дерева содержания
    private splitWidth: number; // Ширина разделителя
    private slideElement: HTMLElement; // Элемент DOM со слайдом
    private fullWidth: number; // Общая ширина всех элементов блока content до начала изменения размера дерева
    private contentWidth: number; // Ширина блока content (в нормальных браузерах совпадает с fullWidth)

    oldWebkit: boolean;

    constructor(private el: ElementRef, private lp: LearningProvider) {

        super();

        this.oldWebkit = BROWSER.oldWebkit();

        this.lp.onChangeTocVisibility
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((visibility: boolean) => {
                this.tocVisibility = visibility;
                if (this.oldWebkit) {
                    setTimeout(() => {
                        this.onResizeStart();
                        this.onResize(0);
                    });
                }
            });

        this.lp.onChangeNavType
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((navType) => {
                this.curNavType = navType;
            })

    }

    ngOnInit() {
        if (this.oldWebkit) {
            setTimeout(() => {
                this.onResizeStart();
                this.onResize(0);
            });
        }
        this.setAnimationState();
    }



    @HostListener('window:resize', ['$event'])
    onWindowResize($event) {
        this.setAnimationState();
    }

    private setAnimationState() {
        this.doTocAnimation = WINDOW.tabletLandscapeUp() ? '' : 'animate';
    }

    // Запоминаем состояние элементов до начала изменения размера дерева
    //
    onResizeStart() {

        this.navElement = this.el.nativeElement.querySelector('.toc');
        if (this.navElement) {
            this.navWidth = this.navElement.clientWidth;
            this.splitWidth = this.el.nativeElement.querySelector('.split').clientWidth;
        } else {
            this.navWidth = 0;
            this.splitWidth = 0;
        }

        this.slideElement = this.el.nativeElement.querySelector('slides');
        this.fullWidth = this.navWidth + this.slideElement.clientWidth + this.splitWidth;

        this.contentWidth = this.el.nativeElement.querySelector('.content').clientWidth;

    }

    // Вызывается при перетаскивании сплиттера
    //
    onResize(offsetPixel: number): void {

        if (!WINDOW.tabletLandscapeUp()) {
            return;
        }

        // Меняем размер дерева

        if (this.oldWebkit) {

            // Для старого webkit устанавливаем ширину только в px

            if (this.navElement) {
                const newNavWidth = this.navWidth + offsetPixel;
                this.navElement.style.width = String(newNavWidth) + "px";
                this.slideElement.style.width = String(this.contentWidth - newNavWidth - this.splitWidth) + "px";
            } else {
                this.slideElement.style.width = String(this.contentWidth) + "px";
            }

        } else {

            // Работает во всех браузерах, кроме Safari 8 и младше

            if (!this.fullWidth) {
                return;
            }
            const navPercent = (((this.navWidth + offsetPixel) / (this.fullWidth)) * 100);
            this.navElement.style.flex = "0 0 " + String(navPercent) + "%";
            this.navElement.style.width = String(navPercent) + "%";


        }

    }

}

