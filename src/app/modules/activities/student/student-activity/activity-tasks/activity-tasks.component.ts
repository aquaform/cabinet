import { Component, OnInit, Input } from '@angular/core';
import { EduStudentTaskDescription, EduStudentActivityDescription, spentTimeDisplayOptions, translateStudentScorePostfix } from '../../student.interface';
import { Router } from '@angular/router';
import { ResService } from '@modules/resources/res/res.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { ResLinkParams } from '@modules/resources/res/res.interface';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-activity-tasks',
  templateUrl: './activity-tasks.component.html',
  styleUrls: ['./activity-tasks.component.scss']
})
export class ActivityTasksComponent implements OnInit {

  @Input() activity: EduStudentActivityDescription;
  isLoading = false;
  spentTimeDisplayOptions = spentTimeDisplayOptions;

  constructor(
    private router: Router,
    private res: ResService,
    private err: ErrorsService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {

  }

  openTask(taskDescription: EduStudentTaskDescription) {

    if (!taskDescription.available) {
      return;
    }

    if (taskDescription.onElectronicResource) {

      this.isLoading = true;

      const params: ResLinkParams = {
        electronicResource: taskDescription.electronicResource,
        userActivity: this.activity.userActivity,
        task: taskDescription.task,
        readonly: !this.activity.actual
      };

      this.res.Open(params).subscribe({
        error: (err) => {
          this.err.register(err, false, true);
          this.isLoading = false;
        },
      });

    }

    if (!taskDescription.onElectronicResource) {
      this.router.navigate(['/education', 'activity', this.activity.userActivity, 'task', taskDescription.task]);
    }

  }

  translateScorePostfix(score: number): Observable<string> {
    return translateStudentScorePostfix(this.translate, score);
  }

}
