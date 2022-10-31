import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AppComponentTemplate } from '@shared/component.template';
import {
  StudentOptionalActivityListElement,
  StudentOptionalRequestData,
  StudentOptionalEntryData,
  StudentOptionalRequestDataApplicationElement,
  requestStatuses,
  NewRequestFormData,
  StudentDirectEntryResponse,
  NewRequestResponse,
  NewRequestData
} from '../student.interface';
import { APIDataTypes, APIServiceNames } from '@modules/root/api/api.interface';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { of, Observable, zip } from 'rxjs';
import { Router } from '@angular/router';
import { AlertService } from '@modules/root/alert/alert.service';
import { AlertMessage } from '@modules/root/alert/alert.interface';
import { durationVariants } from '@modules/activities/activities.interface';


@Component({
  selector: 'app-student-optional-activity',
  templateUrl: './student-optional-activity.component.html',
  styleUrls: ['./student-optional-activity.component.scss']
})
export class StudentOptionalActivityComponent extends AppComponentTemplate {

  @Input() activity: StudentOptionalActivityListElement;

  requests: StudentOptionalRequestDataApplicationElement[];
  entryData: StudentOptionalEntryData;

  isLoading = false;
  isLoadingGlobal = false;
  requestStatuses = requestStatuses;
  newRequestFormData: NewRequestFormData;
  durationVariants = durationVariants;

  @ViewChild('onlyMobileElement', { static: true }) onlyMobileElement: ElementRef;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
    private router: Router,
    private alert: AlertService
  ) {
    super();
    this.clearNewMessageForm();
  }

  ngOnInit() {
    this.getData();
  }

  clearNewMessageForm() {
    this.newRequestFormData = {
      text: "",
      isSaving: false,
    };
  }

  getData() {

    this.isLoading = true;
    this.requests = [];
    this.entryData = null;

    const requests$: Observable<StudentOptionalRequestData> = (this.activity.requiredRequest) ?
      this.api.Get<StudentOptionalRequestData>(
        `edu/education/${this.activity.id}/application/get`,
        {},
        APIServiceNames.edu,
        this.auth.SearchParams(),
        StudentOptionalRequestData,
        APIDataTypes.json
      ).pipe(takeUntil(this.ngUnsubscribe)) : of(null);

    const entry$: Observable<StudentOptionalEntryData> =
      this.api.Get<StudentOptionalEntryData>(
        `edu/education/${this.activity.id}/description`,
        {},
        APIServiceNames.edu,
        this.auth.SearchParams(),
        StudentOptionalEntryData,
        APIDataTypes.json
      ).pipe(takeUntil(this.ngUnsubscribe));

    zip(entry$, requests$).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        const entryData = response[0];
        const requestsData = response[1];
        if (environment.displayLog) {
          console.log("Student request data:", requestsData);
          console.log("Student entry data:", entryData);
        }
        if (requestsData && requestsData.length) {
          this.requests = requestsData.map(val => val.application);
        }
        this.entryData = entryData;
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );

  }

  sendNewRequest() {

    if (this.newRequestFormData.isSaving) {
      return;
    }

    this.newRequestFormData.isSaving = true;

    const dataToSend: NewRequestData = {
      text: this.newRequestFormData.text
    };

    this.api.Get<NewRequestResponse>(
      `edu/education/${this.activity.id}/application/new`,
      dataToSend,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      NewRequestResponse,
      APIDataTypes.json,
    ).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Student new request response:", response);
        }
        this.clearNewMessageForm();
        this.getData();
      },
      (err) => this.err.register(err),
      () => this.newRequestFormData.isSaving = false
    );

  }

  directEntryRequest() {

    this.isLoadingGlobal = true;

    this.api.Get<StudentDirectEntryResponse>(
      `edu/education/${this.activity.id}/entry`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      StudentDirectEntryResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Student direct entry response:", response);
        }
        if (response.isErrors && !response.codeError) {
          const message: AlertMessage = {
            text: response.textError
          }
          this.alert.Open(message);
          return;
        }
        if (response.isErrors && response.codeError) {
          const errorDescription = {
            error: response.codeError,
            message: response.textError,
            parameters: undefined,
            title: "",
          };
          this.err.register(errorDescription);
        }
        if (response.userActivity) {
          this.router.navigate(['/education', 'activity', response.userActivity]);
        }
      },
      (err) => this.err.register(err),
      () => this.isLoadingGlobal = false
    );

  }

  allowedNewRequest() {
    // Запрещаем подавать заявку, если есть заявки любого статуса, кроме Отменено
    if (this.requests.length
      && this.requests.filter(val => val.status === this.requestStatuses.APPROVED
        || val.status === this.requestStatuses.PENDING
        || val.status === this.requestStatuses.REJECTED).length) {
      return false;
    }
    return true;
  }

  isMobile(): boolean {
    if (!this.onlyMobileElement) {
      return false;
    }
    return !(this.onlyMobileElement.nativeElement.offsetParent === null);
    // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  }

}
