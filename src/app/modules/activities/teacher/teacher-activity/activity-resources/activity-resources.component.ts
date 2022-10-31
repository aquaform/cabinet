import { Component, Input } from '@angular/core';
import { EduTeacherActivityDescription } from '../../teacher.interface';
import { AppComponentTemplate } from '@shared/component.template';

@Component({
  selector: 'app-activity-resources',
  templateUrl: './activity-resources.component.html',
  styleUrls: ['./activity-resources.component.scss']
})
export class ActivityResourcesComponent extends AppComponentTemplate {

  @Input() activity: EduTeacherActivityDescription;

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
