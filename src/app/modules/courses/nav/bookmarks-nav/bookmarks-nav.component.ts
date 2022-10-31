import { Component} from "@angular/core";
import { CourseDataInterface, SlideDataInterface } from "../../interface/data-interface/course-data.interface";
import { LearningProvider } from "../../learning/learning.provider";
import { CourseDataProvider } from "../../data/course-data.provider";
import { SlideProvider } from "../../slides/slide/slide.provider";
import { BookmarkElementInterface } from "../../interface/learning-interface/learning.interface";
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';

declare let courseData: CourseDataInterface; // global var

interface Bookmark {
    slide: string;
    title: string;
    data: BookmarkElementInterface;
    editingComment: boolean; // Выполняется правка комментария
}

@Component({
    selector: "app-bookmarks-nav",
    templateUrl: "bookmarks-nav.component.html",
    styleUrls: ["bookmarks-nav.component.scss"]
})

export class BookmarksNavComponent extends AppComponentTemplate {

    bookmarks: Bookmark[] = [];
    activeSlide: SlideDataInterface; // Текущий слайд

    constructor(private lp: LearningProvider, private sp: SlideProvider) {

        super();


        this.lp.onChangeBookmarks.pipe(takeUntil(this.ngUnsubscribe)).subscribe((bookmarks) => {

            this.bookmarks = [];
            if (bookmarks) {
                for (const bookmark of bookmarks.elements) {
                    const tocElement = CourseDataProvider.findTocElement(bookmark.slide);
                    if (tocElement) {
                        this.bookmarks.push({
                            slide: bookmark.slide,
                            title: tocElement.title,
                            data: bookmark,
                            editingComment: false
                        });
                    }
                }
            }

        })

        // Подписываемся на изменение текущего слайда

        this.sp.onChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(slide => {
            this.activeSlide = slide;
        })

    }

    // Открывает слайд
    //
    openElement(slide: string): void {
        this.lp.goToSlide(slide);
    }

    editComment(bookmark: Bookmark) {
        bookmark.editingComment = !bookmark.editingComment;
        this.focus(bookmark);
    }

    private focus(bookmark: Bookmark) {
        setTimeout(() => {
            const element = document.getElementById(this.elementId(bookmark));
            if (element) {
                element.focus();
            }
        }, 100);
    }

    elementId(bookmark: Bookmark): string {
        return `bookmark_${bookmark.slide}`;
    }

}