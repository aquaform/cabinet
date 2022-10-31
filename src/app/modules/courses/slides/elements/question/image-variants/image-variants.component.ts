import { Component, Input, OnChanges, OnDestroy, OnInit, EventEmitter, Output, HostListener } from "@angular/core";
import { QuestionDataInterface } from "../../../../interface/data-interface/slides/question-data.interface";
import { QuestionAnswerInterface } from "../../../../interface/learning-interface/quiz/question-answer.interface";
import { CourseDataProvider } from "../../../../data/course-data.provider";
import { questionZoomValue, QuestionZoomValue } from "../question.zoom";
import { BROWSER } from "../../../../tools/universal/browser";
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    selector: "image-variants",
    templateUrl: "image-variants.component.html",
    styleUrls: ["image-variants.component.scss"]
})

export class ImageVariantsQuestionComponent implements OnInit, OnDestroy, OnChanges {

    @Input() readonly: boolean;
    @Input() quizQuestion: QuestionAnswerInterface; // Вопрос в тесте
    @Input() dataQuestion: QuestionDataInterface; // Данные вопроса (шаблон)
    @Input() showConfirm: boolean; // Доступна кнопка "Подтвердить ответ"
    @Input() isKey: boolean; // Надо показать ключ (правильные ответы)
    @Input() zoom: QuestionZoomValue;

    @Output() submit = new EventEmitter();
    @Output() clear = new EventEmitter();

    zoomValue = questionZoomValue;
    isOldIE: boolean = BROWSER.oldIE();

    imageMapCoords: { [areaHref: string]: string } = {}; // Текущие координаты области карты с учетом масштаба
    imageMapScale: number = 0; // Масштаб картинки относительно оригинала
    imageWidth: number = 0; // Текущая реальная ширина картинки
    imageHeight: number = 0; // Текущая реальная высота картинки
    displaySelected: boolean = false; // Надо показать выбранный ответ на картинке
    selectedColors: {red: string; green: string; gray: string} = {red: '#e33d2f', green: '#278e21', gray: '#8b8b8b'}; // Цвета
    path: string = CourseDataProvider.dataFolderPath();

    constructor(private sanitizer: DomSanitizer) {
    }

    ngOnInit() {
    }

    ngOnChanges() {
        this.displaySelected = (this.readonly || this.isKey);
        this.scaleImageMap();
    }

    ngOnDestroy() {
    }

    @HostListener('window:resize', ['$event'])
    onResize($event) {
        this.scaleImageMap();
    }

    sanitize(url:string){
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    // Выбирает вариант на карте
    //
    selectVariant(variantUUID: string) {
        if (this.readonly) {
            return;
        }
        for (let curVariant of this.quizQuestion.variants) {
            curVariant.selected = false; // Сбрасываем выбор всех вариантов
        }
        const variant = this.quizQuestion.variants.find((v) => v.variant === variantUUID);
        variant.selected = true;
        if (!this.showConfirm) {
            this.submit.emit();
        }
        this.displaySelected = true;
        this.scaleImageMap();
    }

    // Сбрасывает выбор варианта на карте
    //
    clearSelected() {
        if (this.readonly) {
            return;
        }
        for (let curVariant of this.quizQuestion.variants) {
            curVariant.selected = false; // Сбрасываем выбор всех вариантов
        }
        this.displaySelected = false;
        this.scaleImageMap();
        this.clear.emit();
    }

    scaleImageMap(): void {

        setTimeout(() => {

            if (!this.dataQuestion.image.areas) {
                return;
            }

            const mapImageElement = document.getElementById(this.dataQuestion.uuid + '-mapImage');
            if (!mapImageElement) {
                return;
            }
            this.imageWidth = mapImageElement.clientWidth;
            this.imageHeight = mapImageElement.clientHeight;
            const curScale: number = (this.imageWidth && this.dataQuestion.image.width)
                ? mapImageElement.clientWidth / this.dataQuestion.image.width : 1;

            if (this.imageMapScale !== curScale) {

                for (let area of this.dataQuestion.image.areas) {
                    if (curScale === 1) {
                        this.imageMapCoords[area.href] = area.coords;
                    } else {
                        let coords: string[] = area.coords.split(',');
                        let newCoords = [];
                        for (let coord of coords) {
                            newCoords.push(Number(coord) * curScale);
                        }
                        this.imageMapCoords[area.href] = newCoords.join(',');
                    }

                }

                this.imageMapScale = curScale;

            }

            setTimeout(() => {
                this.drawSelected();
            }, 10); // setTimeout чтобы установились размеры canvas

        }, 10); // setTimeout чтобы установились размеры картинок

    }

    private drawSelected() {

        if (this.displaySelected) {

            // Ищем вариант, который будем отображать на картинке

            let variantUUID: string;
            let color: string = this.selectedColors.gray;

            if (this.isKey) {
                const correctVariant = this.dataQuestion.variants.find((v) => v.correct);
                if (!correctVariant) {
                    return;
                }
                variantUUID = correctVariant.uuid;
                color = (correctVariant.correct) ? this.selectedColors.green : this.selectedColors.red;
            } else {
                const selectedVariant = this.quizQuestion.variants.find((v) => v.selected);
                if (!selectedVariant) {
                    return;
                }
                variantUUID = selectedVariant.variant;
                color = (selectedVariant.trueSelected) ? this.selectedColors.green : this.selectedColors.red;
            }

            if (!variantUUID) {
                return;
            }

            // Определяем координаты центра области варианта

            const centerCoords = this.calculateCenterPoint(this.imageMapCoords[variantUUID]);
            if (!centerCoords) {
                return;
            }

            // Рисуем кружок

            this.drawCenter(centerCoords, color);

        }

    }

    // Рисует круг в заданных координатах
    //
    private drawCenter(centerCoords: { x: number, y: number }, color: string) {
        const canvasElement = document.getElementById(this.dataQuestion.uuid + '-selectedCanvas') as HTMLCanvasElement;
        const context = canvasElement.getContext('2d');
        context.clearRect(0, 0, this.imageWidth, this.imageHeight);
        context.beginPath();
        context.arc(centerCoords.x, centerCoords.y, 10, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = '#003300';
        context.stroke();
    }

    // Вычисляет центр области карты
    //
    private calculateCenterPoint(areaCoords: string): { x: number, y: number } {

        let maxX = 0,
            minX = Infinity,
            maxY = 0,
            minY = Infinity;

        let i = 0,
            coords = areaCoords.split(',');

        if (coords.length >= 4) {
            while (i < coords.length) {
                let x = parseInt(coords[i++], 10),
                    y = parseInt(coords[i++], 10);
                if (x < minX) minX = x;
                else if (x > maxX) maxX = x;

                if (y < minY) minY = y;
                else if (y > maxY) maxY = y;
            }

            return {
                x: minX + (maxX - minX) / 2,
                y: minY + (maxY - minY) / 2
            };
        } else if (coords.length >= 2) {
            return {
                x: parseInt(coords[0], 10),
                y: parseInt(coords[1], 10)
            };
        } else {
            return {
                x: 0,
                y: 0
            };
        }


    }

}