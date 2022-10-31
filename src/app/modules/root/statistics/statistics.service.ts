import { Injectable } from '@angular/core';
import { StatisticsEventType, activeDateEventTypes, SendStatisticsRequest, SendStatisticsResponse } from './statistics.interface';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '../errors/errors.service';
import { authStatuses } from '@modules/auth/auth.interface';
import { distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import { APIServiceNames, APIDataTypes } from '../api/api.interface';
import { environment } from '@environments/environment';
import { v4 as uuid } from "uuid";
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private available = false;
  private activeDateTimer: NodeJS.Timer;
  private onlineDetectInterval = 60 * 5 * 1000;
  private lastOnlineDetect: Date;
  private tabUUID: string;
  private tabUUIDStorageName = this.settings.StorageName("tabUUID");
  private skipUnload = false;

  constructor(
    private auth: AuthService,
    private err: ErrorsService,
    private api: ApiService,
    private settings: SettingsService,
  ) {}

  init() {

    const settings = this.settings.Statistics();
    this.available = settings.available;
    this.onlineDetectInterval = settings.periodicity * 1000;

    if (!this.available) {
      return;
    }

    this.auth.OnChange$.pipe(distinctUntilChanged()).subscribe(
      (authStatus) => {
        if (authStatus === authStatuses.AUTHENTICATED) {
          this.start();
        }
      },
      (e) => this.err.register(e)
    );

    window.addEventListener("unload", () => {
      if (this.skipUnload) {
        return;
      }
      this.save(activeDateEventTypes.END, true);
    });

  }

  private start() {

    if (!this.available) {
      return;
    }

    const storageUUID = localStorage.getItem(this.tabUUIDStorageName);

    if (storageUUID) {
      if (environment.displayLog) {
        console.log("Restore online detect interval", storageUUID);
      }
      this.tabUUID = storageUUID;
      localStorage.removeItem(this.tabUUIDStorageName);
    } else {
      if (environment.displayLog) {
        console.log("Start new online detect interval");
      }
      this.tabUUID = uuid();
      this.save(activeDateEventTypes.START, false);
    }

    this.auth.setTabUUID(this.tabUUID);

    if (this.activeDateTimer) {
      clearTimeout(this.activeDateTimer);
    }

    this.activeDateTimer = setInterval(() => this.detectOnline(), this.onlineDetectInterval);

  }

  beforeOpenRes() {

    if (!this.available) {
      return;
    }

    this.skipUnload = true;
    localStorage.setItem(this.tabUUIDStorageName, this.tabUUID);

  }

  private detectOnline() {

    if (!this.available) {
      return;
    }

    const lastDetectMustBe = (this.lastOnlineDetect)
      ? this.lastOnlineDetect.getTime() + this.onlineDetectInterval + (5 * 1000) : 0;

    const currentTime = (new Date()).getTime();

    if (lastDetectMustBe < currentTime) {
      // Если в положенное время не был отправлен запрос
      // для учета состояния онлайн, то начинаем период использования
      // сначала, а старый период будет завершен системой по дате последней активности.
      this.start();
    } else {
      this.save(activeDateEventTypes.ONLINE, false);
    }

  }

  private save(event: StatisticsEventType, onUnload: boolean) {

    if (!this.available) {
      return;
    }

    const requestData: SendStatisticsRequest = {
      event: event,
      tabUUID: this.tabUUID
    }

    if (environment.displayLog) {
      console.log("Save statistics:", requestData);
    }

    this.api.Get<SendStatisticsResponse>(
      "session/setActiveDate",
      requestData,
      APIServiceNames.users,
      this.auth.SearchParams(),
      SendStatisticsResponse,
      APIDataTypes.text,
      undefined,
      onUnload
    ).subscribe(
      (response) => {
        this.lastOnlineDetect = new Date();
        if (environment.displayLog) {
          console.log("Last online detected:", this.lastOnlineDetect);
        }
      },
      (err) => this.err.register(err, true)
    );

  }

}
