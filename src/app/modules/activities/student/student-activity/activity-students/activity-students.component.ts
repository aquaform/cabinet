import { Component, Input } from '@angular/core';
import { EduStudentActivityDescription, EduStudentActivityParticipants } from '../../student.interface';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { takeUntil } from 'rxjs/operators';
import { AppComponentTemplate } from '@shared/component.template';
import { environment } from '@environments/environment';
import { UserDescription } from '@modules/user/user.interface';

@Component({
  selector: 'app-activity-students',
  templateUrl: './activity-students.component.html',
  styleUrls: ['./activity-students.component.scss']
})
export class ActivityStudentsComponent extends AppComponentTemplate {

  @Input() opened = false;
  loaded = false;
  isLoading = false;

  students: UserDescription[] = [];

  @Input() activity: EduStudentActivityDescription;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService) {
    super();
  }

  ngOnInit() {
    if (this.opened) {
      this.open();
    }
  }

  openOrClose() {
    if (this.opened) {
      this.close();
      return;
    }
    if (!this.opened) {
      this.open();
      return;
    }
  }

  close() {
    this.opened = false;
  }

  open() {
    this.opened = true;
    if (!this.loaded) {
      this.load();
    }
  }

  load() {
    if (environment.displayLog) {
      console.log("Participants opening...");
    }
    this.students = [];
    this.isLoading = true;
    this.api.Get<EduStudentActivityParticipants>(
      `edu/participants/${this.activity.providingEducation}/${this.activity.eduTemplate.type}/${this.activity.eduTemplate.id}`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduStudentActivityParticipants,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Participants:", response);
        }
        this.students = response;
        this.loaded = true;
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );
  }

}
