import { Component, Input } from '@angular/core';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AppComponentTemplate } from '@shared/component.template';
import { ReportQuizResultsResponse, ReportQuizAttempt, ReportAnswerQuestion } from '../reports.interface';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-quiz-results',
  templateUrl: './quiz-results.component.html',
  styleUrls: ['./quiz-results.component.scss']
})
export class QuizResultsComponent extends AppComponentTemplate {

  @Input() activity: string;
  @Input() showAnswersQuizResults = false;
  @Input() showScoreQuizResults = false;
  @Input() isClosed = true;

  isLoading = false;

  quizAttempts: ReportQuizAttempt[] = [];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
  ) {
    super();
  }

  ngOnInit() {
    if (!this.isClosed) {
      this.getData();
    }
  }

  getData() {
    this.isLoading = true;
    this.quizAttempts = [];
    this.api.Get<ReportQuizResultsResponse>(
      `edu/quizResults/get/education/${this.activity}`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      ReportQuizResultsResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Quiz results:", response);
        }
        if (response) {
          this.quizAttempts = response;
        }
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );
  }

  changeAnswerDetailsVisibility(answer: ReportAnswerQuestion) {
    if (!answer.displayDetails) {
      return;
    }
    answer.changeUserDetailsStatus();
  }

  displayData() {
    this.isClosed = false;
    this.getData();
  }

}
