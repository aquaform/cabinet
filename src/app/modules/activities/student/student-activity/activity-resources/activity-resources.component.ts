import { Component, OnInit, Input } from '@angular/core';
import { EduStudentActivityDescription } from '../../student.interface';

@Component({
  selector: 'app-activity-resources',
  templateUrl: './activity-resources.component.html',
  styleUrls: ['./activity-resources.component.scss']
})
export class ActivityResourcesComponent implements OnInit {

  @Input() activity: EduStudentActivityDescription;

  constructor() { }

  ngOnInit() {
  }

}
