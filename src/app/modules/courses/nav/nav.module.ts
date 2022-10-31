
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {NavCourseComponent} from "./nav.component";
import { TocNavComponent } from './toc-nav/toc-nav.component';
import { TocElementsComponent } from './toc-nav/toc-elements/toc-elements.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { SearchNavComponent } from './search-nav/search-nav.component';
import { PaginationNavComponent } from './pagination-nav/pagination-nav.component';
import { CommandNavComponent } from './command-nav/command-nav.component';
import { BookmarksNavComponent } from './bookmarks-nav/bookmarks-nav.component';
import { AppPipes } from '../tools/pipes';
import { CurrentBookmarkNavComponent } from './current-bookmark-nav/current-bookmark-nav.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from "@ngx-translate/core";
import { FlyingCloseButtonNavComponent } from './flying-close-button-nav/flying-close-button-nav.component';


@NgModule({
    imports: [CommonModule, RouterModule, AppPipes, FormsModule, TranslateModule],
    exports: [NavCourseComponent, FlyingCloseButtonNavComponent],
    declarations: [
        NavCourseComponent,
        TocNavComponent,
        TocElementsComponent,
        SideNavComponent,
        SearchNavComponent,
        PaginationNavComponent,
        CommandNavComponent,
        BookmarksNavComponent,
        CurrentBookmarkNavComponent,
        FlyingCloseButtonNavComponent
    ]
})

export class NavCourse {

    constructor() {
    }

}