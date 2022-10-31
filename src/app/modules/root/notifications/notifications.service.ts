import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { APIServiceNames } from '../api/api.interface';
import { AuthService } from '@modules/auth/auth.service';
import { NotificationResponse, NotificationRequest, NotificationData } from './notifications.interface';
import { SettingsService } from '../settings/settings.service';
import { ErrorsService } from '../errors/errors.service';
import { environment } from '@environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private getData$ = new BehaviorSubject<NotificationData>(null);
  public GetData$: Observable<NotificationData> = this.getData$.asObservable();

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private settings: SettingsService,
    private err: ErrorsService
  ) {

  }

  public RefreshFromServer() {

    const requestData: NotificationRequest = {
      getCountUsersOnline: this.settings.Users().displayOnlineInMenu
    };

    this.api.Get<NotificationResponse>(
      "notifications", requestData, APIServiceNames.edu, this.auth.SearchParams(), NotificationResponse)
      .subscribe(
        (response) => {
          if (environment.displayLog) {
            console.log("Notifications response data:", response);
          }
          this.getData$.next(response);
          this.auth.UpdateUseDescription(response.user);
        },
        (err) => this.err.register(err, true)
      );

  }

}
