import { Injectable } from '@angular/core';
import { SettingsService } from '../settings/settings.service';
import { Subject, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AuthService } from '@modules/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class IdleService {

  private _detectIdle$ = new Subject<boolean>();
  detectIdle$: Observable<boolean> = this._detectIdle$.asObservable();

  private isWorking = false; // Выполняется отслеживание активности
  private idleTime: number;
  private events: string[] = ['mousemove', 'scroll', 'keypress', 'mousedown', 'touchstart']; // https://stackoverflow.com/a/24989958
  private useCaptureEvents: string[] = ['scroll']; // https://stackoverflow.com/a/32954565
  private idleTimer: NodeJS.Timer;
  private storageName: string = this.settings.StorageName("lastActivity");
  private detectActivity$ = new Subject<boolean>();

  constructor(
    private settings: SettingsService,
    private auth: AuthService,
  ) {

  }

  init() {

    this.idleTime = this.settings.IdleTime();
    if (!this.idleTime) {
      return;
    }

    if (this.isWorking) {
      return;
    }
    this.isWorking = true;

    // Выходим сразу

    const storageValue: string = localStorage.getItem(this.storageName);

    if (storageValue === 'closing') {
      this.timerIsOver();
      return;
    }

    // Смотрим активность в кабинете

    for (const eventName of this.events) {
      window.addEventListener(
        eventName,
        () => this.detectActivity$.next(true),
        this.useCaptureEvents.indexOf(eventName) > -1);
    }

    this.detectActivity$.pipe(debounceTime(100)).subscribe(
      () => this.saveActivity()
    );

    this.idle();

    if (environment.displayLog) {
      console.log("Start detect idle");
    }

  }

  timerIsOver() {
    this.auth.SignOut();
  }

  // Фиксирует факт активности пользователя
  //
  private saveActivity() {
    if (environment.displayLog) {
      console.log("Detect activity");
    }
    localStorage.setItem(this.storageName, String((new Date()).getTime()));
    this._detectIdle$.next(false); // Активность случилась
  }

  // Сбрасывает таймер отслеживания активности
  //
  private startTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.idleTimer = setTimeout(() => this.idle(), 3 * 1000);
    if (environment.displayLog) {
      console.log("Start idle timer");
    }
  }

  // Проверяет наличие или отсутствие активности
  //
  private idle() {
    const storageValue: string = localStorage.getItem(this.storageName);
    if (storageValue === 'closing') {
      this.timerIsOver();
      return;
    }
    const lastActivity: number = (storageValue) ? Number(storageValue) : 0;
    const currentTime: number = (new Date()).getTime();
    this.startTimer();
    if (lastActivity && (currentTime - lastActivity > this.idleTime * 60 * 1000)) {
      if (environment.displayLog) {
        console.log("Detect idle", [lastActivity, currentTime, currentTime - lastActivity, this.idleTime * 60 * 1000]);
      }
      this._detectIdle$.next(true); // Активности не было
    } else {
      this._detectIdle$.next(false); // Активность есть
    }
  }


}
