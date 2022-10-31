import { Component } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { AppComponentTemplate } from '@shared/component.template';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent extends AppComponentTemplate {

  activity: string;
  activityTitle: string;

  task: string;
  taskTitle: string;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
    super();
  }

  ngOnInit() {
    this.activatedRoute.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.activity = params.activity;
      this.task = params.task;
    });
  }

  getActivityTitle(title: string) {
    this.activityTitle = title;
  }

  getTaskTitle(title: string) {
    this.taskTitle = title;
  }

  goToActivity() {
    this.router.navigate(['/education', 'activity', this.activity]);
  }

}
