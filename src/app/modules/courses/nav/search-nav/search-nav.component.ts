import { Component } from "@angular/core";
import {
    CourseDataInterface, SlideDataInterface
} from "../../interface/data-interface/course-data.interface";
import { SearchProvider } from "../../search/search.provider";
import { SearchData, SearchResultElementInterface } from "../../search/api/search-api.interface";
import { LearningProvider } from "../../learning/learning.provider";
import { SlideProvider } from "../../slides/slide/slide.provider";
import { WINDOW } from "../../tools/universal/window";
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';

declare let courseData: CourseDataInterface; // global var

@Component({
    selector: "app-search-nav",
    templateUrl: "search-nav.component.html",
    styleUrls: ["search-nav.component.scss"]
})

export class SearchNavComponent extends AppComponentTemplate {

    activeSlide: SlideDataInterface; // Текущий слайд
    searchData: SearchData;

    constructor(private sh: SearchProvider, private lp: LearningProvider, private sp: SlideProvider) {

        super();

        this.sh.onChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
            this.searchData = data;
            if ("text" in data && WINDOW.tabletLandscapeUp()) {
                // Проверка на размер окна необходима так как при меньшем размере
                // происходит закрывание панели поиска при переходе к слайду,
                // а здесь выполняется перезагрузка, что приведет к закрытию только
                // открытой панели поиска.
                this.lp.reload();
            }
        });

        // Подписываемся на изменение текущего слайда

        this.sp.onChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(slide => {
            this.activeSlide = slide;
        });

    }

    search() {
        this.sh.search(this.searchData.text);
    }

    // Открывает слайд
    //
    openElement(slide: string): void {
        this.lp.goToSlide(slide);
    }

    isElementComplete(element: SearchResultElementInterface): boolean {
        const slide = SlideProvider.find(element.slide);
        return this.lp.isSlideComplete(slide);
    }

    isElementBookmark(element: SearchResultElementInterface): boolean {
        return this.lp.bookmarkIsActive(element.slide);
    }

}