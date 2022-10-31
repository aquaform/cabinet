import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EduScaleMarks, EduMark } from '@modules/activities/activities.interface';

type markValue = string | number;

interface FormData {
  mark: markValue;
}

@Component({
  selector: 'app-set-mark',
  templateUrl: './set-mark.component.html',
  styleUrls: ['./set-mark.component.scss']
})
export class SetMarkComponent implements OnInit {

  @Input() scaleMarks: EduScaleMarks;
  @Input() get markValue(): markValue {
    return this.markFormData.mark;
  }
  set markValue(value: markValue) {
    this.markFormData.mark = value;
  }
  @Input() displayLabels = true;
  @Input() hideButtonsVariants = false;
  @Input() hideEmitButton = false;

  @Output() getMark = new EventEmitter<markValue>();

  @Input() passingScore: number;

  markFormData: FormData = {
    mark: "",
  };

  @Input() displayClearButton: boolean = false;

  constructor() { }

  ngOnInit() {

  }

  selectMark(mark: EduMark) {
    this.markFormData.mark = mark.id;
    this.emitMark();
  }

  emitMark() {
    this.getMark.emit(this.markFormData.mark);
  }

  clearMark() {
    this.markFormData.mark = undefined;
    this.emitMark();
  }

  emitMarkOnChange() {
    if (!this.hideEmitButton) {
      return;
    }
    this.emitMark();
  }

}
