import {Component} from "@angular/core";
import { AppComponentTemplate } from "@shared/component.template";
import {navPositions, navTypes} from "../../nav/nav.interface";

@Component({
    selector: "slides-layout",
    templateUrl: "slides-layout.component.html",
    styleUrls: ["slides-layout.component.scss"]
})

export class SlidesLayoutComponent extends AppComponentTemplate {

    navTypes = navTypes;
    navPositions = navPositions;

    constructor() {
        super();
    }

    ngOnInit() {
    }

}

