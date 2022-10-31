import { AfterViewInit, Component, Input } from "@angular/core";
import { SlideDataInterface, TOCElementInterface } from "../../../interface/data-interface/course-data.interface";
import { TocNavTools } from "../toc-nav.tools";
import { SlideProvider } from "../../../slides/slide/slide.provider";
import { LearningProvider } from "../../../learning/learning.provider";
import { BROWSER } from "../../../tools/universal/browser";
import { SearchProvider } from "../../../search/search.provider";
import { Scroll } from "../../../tools/universal/scroll";
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: "app-toc-elements",
    templateUrl: "toc-elements.component.html",
    styleUrls: ["toc-elements.component.scss"]
})

export class TocElementsComponent extends AppComponentTemplate implements AfterViewInit {

    @Input() elements: TOCElementInterface[]; // Слайд

    public activeSlide: SlideDataInterface; // Текущий слайд
    public oldIE: boolean;
    public oldWebKit: boolean;

    constructor(private sp: SlideProvider, private lp: LearningProvider, private sh: SearchProvider) {

        super();

        let onInit = true;

        // Подписываемся на изменение текущего слайда

        this.sp.onChange.pipe(takeUntil(this.ngUnsubscribe)).subscribe(slide => {
            this.activeSlide = slide;
            if (onInit && this.activeSlide) {
                // При первой инициализации элемента содержания
                // считаем, что текущий активный слайд был выбран.
                // Это необходимо, чтобы предотвратить переход к активному
                // элементу при открытии/закрытии веток дерева содержания.
                // Т.е. если мы начали открывать ветку, то начали создаваться эти элементы.
                // В этом случае нам не нужно переходить к текущему выбранному, так как мы
                // сосредоточились на открываемой ветке.
                this.lp.lastTocSlideSelected = this.activeSlide.uuid;
            }
            if (!onInit && this.activeSlide && this.activeSlide.uuid !== this.lp.lastTocSlideSelected) {
                // Сбрасываем последний выбранный элемент содержания,
                // если перешли к другому слайду и он не равен выбранному.
                // Такая ситуация возникает при переходе к другому элементу НЕ из содержания.
                // В этом случае мы ничего не выбирали из содержания сбрасываем то, что запомнили ранее.
                // Исключение: первая инициализация элемента содержания.
                this.lp.lastTocSlideSelected = "";
            }
            this.scrollToActiveElement();
            onInit = false;
        })


        this.oldIE = BROWSER.oldIE();
        this.oldWebKit = BROWSER.oldWebkit();

    }

    ngAfterViewInit() {
        this.scrollToActiveElement();
    }

    isLastLevelElement(element: TOCElementInterface): boolean {
        return TocNavTools.isLastLevelElement(element);
    }

    openCloseFolder(element: TOCElementInterface) {
        element.opened = !element.opened;
    }

    // Открывает слайд
    //
    openElement(element: TOCElementInterface): void {
        this.lp.lastTocSlideSelected = element.slide;
        this.sh.clear();
        this.lp.goToSlide(element.slide);
    }

    isElementComplete(element: TOCElementInterface): boolean {
        const slide = SlideProvider.find(element.slide);
        return this.lp.isSlideComplete(slide);
    }

    isElementBookmark(element: TOCElementInterface): boolean {
        return this.lp.bookmarkIsActive(element.slide);
    }

    // Определяет, видим ли элемент
    // Вызывается внутри pipe, поэтому не должно быть обращения к this
    //
    visibleElements(element: TOCElementInterface, params: any): boolean {
        return !element.hidden;
    }

    // Идентификатор элемента содержания для указания в DOM
    // Используется для автоскрола
    //
    elementId(slideUUID: string): string {
        return "tocElement-" + slideUUID;
    }

    // Прокручивает до активного элемента
    //
    scrollToActiveElement(): void {
        if (!this.activeSlide) {
            return;
        }
        if (this.activeSlide.uuid === this.lp.lastTocSlideSelected) {
            return;
        }

        const tocElement = document.getElementById(this.elementId(this.activeSlide.uuid));
        if (!tocElement) {
            return;
        }
        if (Scroll.isScrolledIntoView(tocElement)) {
            return;
        }
        tocElement.scrollIntoView(true);
    }

}

