import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { EduStudentTaskAttempt } from '../../student.interface';
import { SettingsService } from '@modules/root/settings/settings.service';

@Component({
  selector: 'app-task-mark',
  templateUrl: './task-mark.component.html',
  styleUrls: ['./task-mark.component.scss']
})
export class TaskMarkComponent implements OnInit {

  @Input() taskData: EduStudentTaskAttempt;

  @HostBinding("class.green") get green(): boolean { return this.taskData.green; }
  @HostBinding("class.red") get red(): boolean { return this.taskData.red; }
  @HostBinding("class.orange") get orange(): boolean { return this.taskData.orange; }

  constructor(
    private settings: SettingsService,
  ) { }

  ngOnInit() {

  }



}
