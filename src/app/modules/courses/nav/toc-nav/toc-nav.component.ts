import { Component } from "@angular/core";
import { CourseDataInterface, SlideDataInterface, TOCElementInterface } from "../../interface/data-interface/course-data.interface";
import { SlideProvider } from "../../slides/slide/slide.provider";
import { TocNavTools } from "./toc-nav.tools";
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';

declare let courseData: CourseDataInterface; // global var

@Component({
    selector: "app-toc-nav",
    templateUrl: "toc-nav.component.html",
    styleUrls: ["toc-nav.component.scss"]
})

export class TocNavComponent extends AppComponentTemplate {

    public courseData: CourseDataInterface; // Все данные курса
    public activeSlide: SlideDataInterface; // Текущий слайд

    constructor(private sp: SlideProvider) {

        super();

        this.courseData = courseData;

        // Подписываемся на изменение текущего слайда

        this.sp.onChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(slide => {
            this.activeSlide = slide;
            if (this.activeSlide) {
                this.openNode(undefined, this.activeSlide.uuid);
            }
        })

    }

    // Раскрывает дерево до активного слайда
    //
    openNode(uuidNode?: string, uuidSlide?: string) {

        if (!uuidNode && !uuidSlide) {
            return;
        }

        const activeElements: TOCElementInterface[] = [];
        TocNavTools.findElements(activeElements, this.courseData.toc.elements, uuidNode, uuidSlide);
        for (const activeElement of activeElements) {
            const parentElements: TOCElementInterface[] = [];
            TocNavTools.findElements(parentElements, this.courseData.toc.elements, activeElement.parent);
            for (const parentElement of parentElements) {
                parentElement.opened = true;
                this.openNode(parentElement.uuid); // Рекурсия
            }
        }

    }

}

