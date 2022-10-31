import {Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output} from "@angular/core";

@Component({
    selector: "split",
    templateUrl: "split.component.html",
    styleUrls: ["split.component.scss"]
})

export class SplitComponent implements OnInit, OnDestroy  {

    @Output() onResizeStart: EventEmitter<void> = new EventEmitter();
    @Output() onResize: EventEmitter<number> = new EventEmitter(); /* Вернет на сколько передвинули разделитель */

    isMoving: boolean = false;
    private startPosition: number = 0;

    constructor(private el: ElementRef) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown($event) {
        this.dragStart($event);
    }

    @HostListener('touchstart', ['$event'])
    onTouchStart($event) {
        this.dragStart($event);
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove($event) {
        this.onDrag($event);
    }

    @HostListener('document:touchmove', ['$event'])
    onTouchMove($event) {
        this.onDrag($event);
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp($event) {
        this.dragStop($event);
    }

    @HostListener('document:touchend', ['$event'])
    onTouchEnd($event) {
        this.dragStop($event);
    }

    @HostListener('document:touchcancel', ['$event'])
    onTouchCancel($event) {
        this.dragStop($event);
    }

    private dragStart(event: MouseEvent | TouchEvent) {
        event.preventDefault();
        this.isMoving = true;
        this.startPosition = SplitComponent.position(event);
        this.onResizeStart.emit();
    }

    private onDrag(event: MouseEvent | TouchEvent) {
        this.move(event);
    }

    private dragStop(event: MouseEvent | TouchEvent) {
        this.isMoving = false;
    }

    private move(event: MouseEvent | TouchEvent) {

        if (!this.isMoving) {
            return;
        }

        const position = SplitComponent.position(event);
        const offsetPixel =  position - this.startPosition;
        this.onResize.emit(offsetPixel);

    }

    private static position(event: MouseEvent | TouchEvent): number {
        let left: number;
        if (event instanceof MouseEvent) {
            return event.screenX;
        } else if (event instanceof TouchEvent) {
            return event.touches[0].screenX;
        } else {
            return 0;
        }

    }

}

