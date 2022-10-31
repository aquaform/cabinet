import { ChangeDetectorRef, Component, HostBinding, Input } from '@angular/core';
import { environment } from '@environments/environment';
import { QualityPollFormData } from '@modules/activities/student/student.interface';
import { AuthService } from '@modules/auth/auth.service';
import { APIDataTypes, APIServiceNames } from '@modules/root/api/api.interface';
import { ApiService } from '@modules/root/api/api.service';
import { DatesTools } from '@modules/root/dates/dates.class';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { NumbersTools } from '@modules/root/numbers/numbers.class';
import { TranslateService } from '@ngx-translate/core';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';
import { ReportActivityPollResult, ReportActivityPollResultsResponse } from '../reports.interface';

interface Statistic {
  average: number;
  max: number;
  countLabel: string;
  count: number;
}

@Component({
  selector: 'app-activity-poll-results',
  templateUrl: './activity-poll-results.component.html',
  styleUrls: ['./activity-poll-results.component.scss']
})
export class ActivityPollResultsComponent extends AppComponentTemplate {

  @Input() providingEducation: string;
  @Input() hideTitle = false;
  @Input() shortMark = false;
  @Input() @HostBinding('class.isBlock') isBlock: boolean = true;

  private _userFormData: QualityPollFormData = null;

  @Input() set userFormData(val: QualityPollFormData) {
    this._userFormData = val;
    this.updateUserFormData();
  };

  get userFormData() {
    return this._userFormData;
  }

  isLoading = false;

  allResults: ReportActivityPollResult[] = [];
  visibleResults: ReportActivityPollResult[] = [];
  startVisibleResults = 3;
  displayAllResults = false;
  statistic: Statistic = {
    average: 0,
    max: 0,
    count: 0,
    countLabel: ""
  };

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this.allResults = [];
    this.api.Get<ReportActivityPollResultsResponse>(
      `edu/quality/get/${this.providingEducation}`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      ReportActivityPollResultsResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Activity poll results:", response);
        }
        this.allResults = response;
        this.getVisibleResults();
        this.getStatistic();
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );
  }

  updateUserFormData() {

    if (!this.userFormData) {
      return;
    }

    const resultCurrentUser = this.allResults.find(val => val.user.id === this.userFormData.user.id);

    if (resultCurrentUser) {
      resultCurrentUser.mark = this.userFormData.mark;
      resultCurrentUser.comment = this.userFormData.comment;
    }

    if (!resultCurrentUser && this.userFormData.mark) {
      const currentUserResult: ReportActivityPollResult = {
        comment: this.userFormData.comment,
        date: new Date(),
        mark: this.userFormData.mark,
        user: this.userFormData.user
      };
      this.allResults.push(currentUserResult);
    }

    this.getStatistic();
    this.getVisibleResults();
    this.cd.detectChanges();

  }

  getStatistic() {
    const allMarks: number[] = this.allResults.map(val => val.mark);
    this.statistic.average = NumbersTools.average(allMarks, 1);
    this.statistic.max = 5;
    this.statistic.count = this.allResults.length;
    this.translate.get([
      'REPORTS.ACTIVITY_POLL.COUNT_1',
      'REPORTS.ACTIVITY_POLL.COUNT_2',
      'REPORTS.ACTIVITY_POLL.COUNT_5',
    ], this.statistic).subscribe(
      (labels) => {
        this.statistic.countLabel = NumbersTools.declensionNumber(this.statistic.count,
          [labels['REPORTS.ACTIVITY_POLL.COUNT_1'], labels['REPORTS.ACTIVITY_POLL.COUNT_2'], labels['REPORTS.ACTIVITY_POLL.COUNT_5']]);
      },
      (err) => this.err.register(err)
    );
  }

  getVisibleResults() {

    this.visibleResults = [];

    const resultGroups: ReportActivityPollResult[][] = [];
    if (this.userFormData && this.userFormData.user) {
      resultGroups.push(this.allResults.filter(val => val.user.id === this.userFormData.user.id));
      resultGroups.push(this.allResults.filter(val => val.user.id !== this.userFormData.user.id));
    } else {
      resultGroups.push(this.allResults);
    }

    for (const resultGroup of resultGroups) {
      if (!this.displayAllResults && this.visibleResults.length >= this.startVisibleResults) {
        break;
      }
      DatesTools.sortByDate(resultGroup, val => val.date, true);
      for (const currentResult of resultGroup) {
        if (!this.displayAllResults && this.visibleResults.length >= this.startVisibleResults) {
          break;
        }
        this.visibleResults.push(currentResult);
      }
    }

  }

  currentDate(): Date {
    return new Date();
  }

  changeDisplayAllResults(): false {
    this.displayAllResults = !this.displayAllResults;
    this.getVisibleResults();
    return false;
  }

}
