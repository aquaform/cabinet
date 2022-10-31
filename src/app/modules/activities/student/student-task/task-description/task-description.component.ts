import { Component, OnInit, Input } from '@angular/core';
import { EduStudentTaskAttempt } from '../../student.interface';

@Component({
  selector: 'app-task-description',
  templateUrl: './task-description.component.html',
  styleUrls: ['./task-description.component.scss'],
})
export class TaskDescriptionComponent implements OnInit {

  @Input() taskData: EduStudentTaskAttempt;

  constructor() { }

  ngOnInit() {
  }

}
