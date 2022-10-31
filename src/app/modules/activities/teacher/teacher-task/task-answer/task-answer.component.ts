import { Component, Input } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { EduStudentTaskAttempt } from '@modules/activities/student/student.interface';

@Component({
  selector: 'app-task-answer',
  templateUrl: './task-answer.component.html',
  styleUrls: ['./task-answer.component.scss']
})
export class TaskAnswerComponent extends AppComponentTemplate {

  @Input() taskData: EduStudentTaskAttempt;

  constructor() {
    super();
  }

  ngOnInit() {
  }


}
