import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentActivitiesComponent } from './student-activities/student-activities.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { StudentActivityComponent } from './student-activity/student-activity.component';
import { RootModule } from '@modules/root/root.module';
import { StudentTaskComponent } from './student-task/student-task.component';
import { TaskDescriptionComponent } from './student-task/task-description/task-description.component';
import { TaskAnswerComponent } from './student-task/task-answer/task-answer.component';
import { ActivityDescriptionComponent } from './student-activity/activity-description/activity-description.component';
import { ActivityStudentsComponent } from './student-activity/activity-students/activity-students.component';
import { ActivityTasksComponent } from './student-activity/activity-tasks/activity-tasks.component';
import { ActivityTeachersComponent } from './student-activity/activity-teachers/activity-teachers.component';
import { ActivityResourcesComponent } from './student-activity/activity-resources/activity-resources.component';
import { TaskMarkComponent } from './student-task/task-mark/task-mark.component';
import { FormsModule } from '@angular/forms';
import { StudentOptionalActivitiesComponent } from './student-optional-activities/student-optional-activities.component';
import { StudentCertificatesComponent } from './student-certificates/student-certificates.component';
import { AuthModule } from '@modules/auth/auth.module';
import { ActivityUserFilesComponent } from './student-activity/activity-user-files/activity-user-files.component';
import { ResourcesModule } from '@modules/resources/resources.module';
import { UserModule } from '@modules/user/user.module';
import { ReportsModule } from '../reports/reports.module';
import { ClipboardModule } from 'ngx-clipboard';
import { StudentOptionalActivityComponent } from './student-optional-activity/student-optional-activity.component';
import { EditorModule } from '@modules/root/editor/editor.module';
import { ActivityPollComponent } from './student-activity/activity-poll/activity-poll.component';

@NgModule({
  declarations: [
    StudentActivitiesComponent,
    StudentActivityComponent,
    StudentTaskComponent,
    ActivityDescriptionComponent,
    ActivityPollComponent,
    ActivityResourcesComponent,
    ActivityStudentsComponent,
    ActivityTasksComponent,
    ActivityTeachersComponent,
    TaskDescriptionComponent,
    TaskAnswerComponent,
    TaskMarkComponent,
    StudentOptionalActivitiesComponent,
    StudentCertificatesComponent,
    ActivityUserFilesComponent,
    StudentOptionalActivityComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    RootModule,
    FormsModule,
    AuthModule,
    ResourcesModule,
    UserModule,
    ReportsModule,
    ClipboardModule,
    EditorModule
  ],
  exports: [
    StudentActivitiesComponent,
    StudentActivityComponent,
    StudentTaskComponent,
    StudentCertificatesComponent,
    StudentOptionalActivitiesComponent,
    ActivityUserFilesComponent,
    StudentOptionalActivityComponent
  ]
})
export class StudentModule { }
