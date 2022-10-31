/**
 * Created by Baranoshnikov on 20.04.2017.
 * Работа с данными курса (шаблоны данных).
 *
 */

import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {CourseDataProvider} from "./course-data.provider";
import {QuizData} from "./quiz/index";

@NgModule({
    imports: [CommonModule],
    exports: [QuizData],
    declarations: [],
    providers: [
        CourseDataProvider
    ]
})

export class CourseData {

    constructor() {

    }

}