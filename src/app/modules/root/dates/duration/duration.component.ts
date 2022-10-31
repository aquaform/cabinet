import { Component, Input } from '@angular/core';
import { DatesTools } from '../dates.class';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { NumbersTools } from '@modules/root/numbers/numbers.class';
import { AppComponentTemplate } from '@shared/component.template';

@Component({
  selector: 'app-duration',
  templateUrl: './duration.component.html',
  styleUrls: ['./duration.component.scss']
})
export class DurationComponent extends AppComponentTemplate  {

  private _seconds: number;

  @Input() set seconds(val: number) {
    this._seconds = val;
    this.init();
  };

  get seconds(): number {
    return this._seconds;
  }

  @Input() isEduHours: boolean;
  @Input() getDays: boolean;
  @Input() roundDay = true;

  duration: { h: number; m: number; d: number };
  labels: { h: string, m: string, d: string, dPlus1: string } = { h: '', m: '', d: '', dPlus1: '' };
  // Если есть хотя бы один полный день, то выводим его и плюс 1 текущий день.

  constructor(
    private translate: TranslateService,
    private err: ErrorsService
  ) {
    super();
  }

  ngOnInit() {
    this.init();
  }

  init() {
    if (!this.seconds) {
      this.duration = null;
      return;
    }
    this.duration = DatesTools.duration(this.seconds, this.isEduHours, this.getDays);
    this.translate.get([
      'DATES.DAY_1',
      'DATES.DAY_2',
      'DATES.DAY_5',
      'DATES.HOUR_1',
      'DATES.HOUR_2',
      'DATES.HOUR_5',
      'DATES.HOUR_EDU_1',
      'DATES.HOUR_EDU_2',
      'DATES.HOUR_EDU_5',
      'DATES.MINUTES_1',
      'DATES.MINUTES_2',
      'DATES.MINUTES_5'
    ]).subscribe(
      (labels) => {

        if (this.isEduHours) {
          this.labels.h = NumbersTools.declensionNumber(this.duration.h,
            [labels['DATES.HOUR_EDU_1'], labels['DATES.HOUR_EDU_2'], labels['DATES.HOUR_EDU_5']]);
        } else {
          this.labels.h = NumbersTools.declensionNumber(this.duration.h,
            [labels['DATES.HOUR_1'], labels['DATES.HOUR_2'], labels['DATES.HOUR_5']]);
        }

        this.labels.m = NumbersTools.declensionNumber(this.duration.m,
          [labels['DATES.MINUTES_1'], labels['DATES.MINUTES_2'], labels['DATES.MINUTES_5']]);

        this.labels.d = NumbersTools.declensionNumber(this.duration.d,
          [labels['DATES.DAY_1'], labels['DATES.DAY_2'], labels['DATES.DAY_5']]);

        this.labels.dPlus1 = NumbersTools.declensionNumber(this.duration.d + 1,
            [labels['DATES.DAY_1'], labels['DATES.DAY_2'], labels['DATES.DAY_5']]);

      },
      (err) => this.err.register(err)
    );
  }

}
