import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { TeacherActivityComponent } from './teacher-activity/teacher-activity.component';
import { TeacherActivitiesComponent } from './teacher-activities/teacher-activities.component';
import { RootModule } from '@modules/root/root.module';
import { ActivityDescriptionComponent } from './teacher-activity/activity-description/activity-description.component';
import { ActivityCheckListComponent } from './teacher-activity/activity-check-list/activity-check-list.component';
import { ActivityResourcesComponent } from './teacher-activity/activity-resources/activity-resources.component';
import { ActivityTeachersComponent } from './teacher-activity/activity-teachers/activity-teachers.component';
import { FormsModule } from '@angular/forms';
import { TeacherTasksComponent } from './teacher-tasks/teacher-tasks.component';
import { TeacherTaskComponent } from './teacher-task/teacher-task.component';
import { TaskAnswerComponent } from './teacher-task/task-answer/task-answer.component';
import { TaskDescriptionComponent } from './teacher-task/task-description/task-description.component';
import { TaskMarkComponent } from './teacher-task/task-mark/task-mark.component';
import { UserModule } from '@modules/user/user.module';
import { ResourcesModule } from '@modules/resources/resources.module';
import { MarksModule } from '@modules/root/marks/marks.module';
import { EditorModule } from '@modules/root/editor/editor.module';
import { ReportsModule } from '../reports/reports.module';

@NgModule({
  declarations: [
    TeacherActivityComponent,
    TeacherActivitiesComponent,
    ActivityDescriptionComponent,
    ActivityCheckListComponent,
    ActivityResourcesComponent,
    ActivityTeachersComponent,
    TeacherTasksComponent,
    TeacherTaskComponent,
    TaskAnswerComponent,
    TaskDescriptionComponent,
    TaskMarkComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    RootModule,
    FormsModule,
    UserModule,
    ResourcesModule,
    MarksModule,
    EditorModule,
    ReportsModule
  ],
  exports: [
    TeacherActivityComponent,
    TeacherActivitiesComponent,
    TeacherTasksComponent,
    TeacherTaskComponent
  ]
})
export class TeacherModule { }
