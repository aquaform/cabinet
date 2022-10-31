import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ApiService } from '../../root/api/api.service';
import { SettingsService } from '../../root/settings/settings.service';
import { APIServiceNames } from '../../root/api/api.interface';
import { AuthService } from '@modules/auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CourseAPISettings, GetAddressRequest, GetAddressResponse, ResLinkParams } from './res.interface';
import { StatisticsService } from '@modules/root/statistics/statistics.service';
import { Router } from '@angular/router';
import { CourseSettingsInterface } from '@modules/courses/settings/settings.interface';

@Injectable({
  providedIn: 'root'
})
export class ResService {

  constructor(
    private api: ApiService,
    private settings: SettingsService,
    private auth: AuthService,
    private statistic: StatisticsService,
    private router: Router,
  ) { }

  public Open(params: ResLinkParams): Observable<void> {

    params.currentRoute = this.router.routerState.snapshot.url;

    const search = this.getResLink(params);

    if (environment.displayLog) {
      console.log("Open res by search:", search);
    }

    const requestData: GetAddressRequest = {
      search: search,
      base: this.settings.ResBase(),
      closeURL: encodeURIComponent(btoa(encodeURIComponent(location.href)))
    };

    return this.api.Get<GetAddressResponse>(
      "address/get",
      requestData,
      APIServiceNames.res,
      this.auth.SearchParams(),
      GetAddressResponse
    ).pipe(map((response) => {

        if (environment.displayLog) {
          console.log("Res data:", response);
        }

        if ("isCourseData" in response && response.isCourseData) {

          const courseSettingsStorageName = this.settings.StorageName('courseSettings');
          const courseAPISettingsStorageName = this.settings.StorageName('courseAPISettings');

          const courseSettings: CourseSettingsInterface = {
            api: {
              name: "ws",
              mode: "auto",
              supportFileDownload: false
            },
            data: {
              base: this.settings.ResBase(),
              storage: `${params.electronicResource}/${response.checkSum}`,
              container: "cabinet"
            },
            preventCache: false,
            downloadPDF: false
          };

          localStorage.setItem(courseSettingsStorageName, JSON.stringify(courseSettings));

          const courseAPISettings: CourseAPISettings = {
            ...params,
            closePath: this.router.routerState.snapshot.url,
            storageNamesForClear: [courseSettingsStorageName, courseAPISettingsStorageName],
            user: this.auth.getUserDescription().id,
            isTerminate: false,
            isUnload: false,
            learningActivity: "",
            checkSum: ""
          };

          localStorage.setItem(courseAPISettingsStorageName, JSON.stringify(courseAPISettings));

          this.router.navigate(['/course']);

          return;

        }

        if ("address" in response) {
          localStorage.setItem(this.settings.StorageName("outputHref"), location.href);
          this.statistic.beforeOpenRes();
          location.href = response.address;
          return;
        }

      }));

  }

  private getResLink(params: ResLinkParams): string {

    let resLink = '?';

    if (params.electronicCourse) {
      resLink += 'course=' + params.electronicCourse + '&'; // Новые курсы 3.2+
    }

    if (params.electronicResource) {
      resLink += 'res=' + params.electronicResource + '&'; // Старые курсы 3.0
    }

    if (params.userActivity) {
      resLink += 'userActivity=' + params.userActivity + '&';
    }

    if (params.task) {
      resLink += 'task=' + params.task + '&';
    }

    if (params.fragment) {
      resLink += 'fragment=' + params.fragment + '&';
    }

    if (params.providingEducation) {
      resLink += 'providingEducation=' + params.providingEducation + '&';
    }

    if (params.user) {
      resLink += 'user=' + params.user + '&';
    }

    if (params.item) {
      resLink += 'item=' + params.item + '&';
    }

    if (params.readonly) {
      resLink += 'readonly=true&';
    }

    resLink = resLink.slice(0, -1);

    return resLink;

  }

}
