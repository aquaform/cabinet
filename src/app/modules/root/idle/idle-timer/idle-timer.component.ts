import { Component, HostBinding } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { IdleService } from '../idle.service';
import { AuthService } from '@modules/auth/auth.service';
import { takeUntil } from 'rxjs/operators';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { authStatuses } from '@modules/auth/auth.interface';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-idle-timer',
  templateUrl: './idle-timer.component.html',
  styleUrls: ['./idle-timer.component.scss']
})
export class IdleTimerComponent extends AppComponentTemplate {

  @HostBinding("class.visibility") visibility = false;

  authStatus: authStatuses = authStatuses.UNKNOWN;
  timerSize = 10;
  timerValue: BehaviorSubject<number> = new BehaviorSubject<number>(this.timerSize);
  timer: NodeJS.Timer;

  constructor(
    private idle: IdleService,
    private auth: AuthService,
    private err: ErrorsService
  ) {
    super();
  }

  ngOnInit() {

    this.idle.detectIdle$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (isIdle) => this.setVisibility(isIdle),
        (err) => this.err.register(err)
      );

    this.auth.OnChange$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        status => {
          this.authStatus = status;
          this.setVisibility(false);
        },
        err => this.err.register(err)
      );

  }

  setVisibility(isIdle: boolean) {
    if (!isIdle) {
      this.clearTimer(); // Убираем таймер, так как есть активность
      this.visibility = false;
      return;
    }
    if (this.authStatus !== authStatuses.AUTHENTICATED) {
      return; // Простой без авторизации не учитываем
    }
    if (this.visibility) {
      return; // Уже идет таймер
    }
    this.visibility = true;
    this.clearTimer();
    this.timerValue.next(this.timerSize);
    this.timer = setInterval(() => this.changeTimer(), 1 * 1000);
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  changeTimer() {
    if (this.timerValue.value === 0) {
      this.clearTimer();
      this.timerIsOver();
    } else {
      this.timerValue.next(this.timerValue.value - 1);
    }

  }

  timerIsOver() {
    this.idle.timerIsOver();
  }

}
