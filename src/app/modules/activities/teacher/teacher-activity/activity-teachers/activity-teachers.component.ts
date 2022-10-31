import { Component, Input } from '@angular/core';
import { EduTeacherActivityDescription, EduTeacherActivityTeachers } from '../../teacher.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { TeacherUserDescription } from '@modules/user/user.interface';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { environment } from '@environments/environment';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-activity-teachers',
  templateUrl: './activity-teachers.component.html',
  styleUrls: ['./activity-teachers.component.scss']
})
export class ActivityTeachersComponent extends AppComponentTemplate {

  @Input() activity: EduTeacherActivityDescription;
  @Input() opened = false;

  loaded = false;
  isLoading = false;

  teachers: TeacherUserDescription[] = [];

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
    this.teachers = [];
    this.isLoading = true;
    this.api.Get<EduTeacherActivityTeachers>(
      `edu/teachers/${this.activity.providingEducation}/${this.activity.eduTemplate.type}/${this.activity.eduTemplate.id}`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      EduTeacherActivityTeachers,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Participants:", response);
        }
        this.teachers = response;
        this.loaded = true;
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );
  }

  displayTeacherRole(): boolean {
    if (!this.teachers || !this.teachers.length) {
      return false;
    }
    const firstRole = this.teachers[0].roleName;
    if (this.teachers.findIndex(val => val.roleName !== firstRole) > -1) {
      return true;
    }
    return false;
  }

}
