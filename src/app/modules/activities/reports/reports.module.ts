import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizResultsComponent } from './quiz-results/quiz-results.component';
import { TranslateModule } from '@ngx-translate/core';
import { RootModule } from '@modules/root/root.module';
import { ActivityPollResultsComponent } from './activity-poll-results/activity-poll-results.component';
import { UserModule } from '@modules/user/user.module';
import { DatesModule } from '@modules/root/dates/dates.module';
import { ReportsFromBackendComponent } from './reports-from-backend/reports-from-backend.component';

@NgModule({
  declarations: [
    QuizResultsComponent,
    ActivityPollResultsComponent,
    ReportsFromBackendComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RootModule,
    UserModule,
    DatesModule
  ],
  exports: [
    QuizResultsComponent,
    ActivityPollResultsComponent,
    ReportsFromBackendComponent
  ]
})
export class ReportsModule { }
