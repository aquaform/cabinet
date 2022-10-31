import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { NumbersTools } from '@modules/root/numbers/numbers.class';
import { TranslateService } from '@ngx-translate/core';
import { AppComponentTemplate } from '@shared/component.template';

interface Star {
  selected: boolean;
  value: number;
  iconName: "whiteStar" | "yellowStar" | "halfStar";
}

@Component({
  selector: 'app-display-star-mark',
  templateUrl: './display-star-mark.component.html',
  styleUrls: ['./display-star-mark.component.scss']
})
export class DisplayStarMarkComponent extends AppComponentTemplate {

  private _mark = 0;

  @Input() set mark(val: number) {
    this._mark = Math.round(val);
    this.updateStars();
  };

  get mark() {
    return this._mark;
  }

  @Input() interactive: boolean;
  @Input() smallSize = false;

  @Input() countResults: number;
  countResultsLabel = "";

  @Output() getMark = new EventEmitter<number>();

  stars: Star[] = [];

  constructor(
    private translate: TranslateService,
    private err: ErrorsService,
  ) {
    super();
  }

  ngOnInit(): void {

    this.updateStars();

    this.translate.get([
      'REPORTS.ACTIVITY_POLL.COUNT_1',
      'REPORTS.ACTIVITY_POLL.COUNT_2',
      'REPORTS.ACTIVITY_POLL.COUNT_5',
    ], {count: this.countResults}).subscribe(
      (labels) => {
        this.countResultsLabel = NumbersTools.declensionNumber(this.countResults,
          [labels['REPORTS.ACTIVITY_POLL.COUNT_1'], labels['REPORTS.ACTIVITY_POLL.COUNT_2'], labels['REPORTS.ACTIVITY_POLL.COUNT_5']]);
      },
      (err) => this.err.register(err)
    );

  }

  selectStar(star: Star) {
    if (!this.interactive) {
      return;
    }
    this.mark = star.value;
    this.getMark.emit(star.value);
    this.updateStars();
  }

  updateStars() {

    const values = [1, 2, 3, 4, 5];

    this.stars = [];

    for (const value of values) {
      const selected = (this.mark >= value) ? true : false;
      const star: Star = {
        value: value,
        selected: selected,
        iconName: (selected) ? 'yellowStar' : 'whiteStar'
      }
      this.stars.push(star);
    }
  }

}
