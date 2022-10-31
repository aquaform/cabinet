import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subject, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
import * as Sentry from "@sentry/browser";
import { SettingsService } from '../settings/settings.service';
import { Language } from '../i18n/i18n.class';
import { AnyObject } from '@shared/common.interface';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {

  private onGetSessionError$: Subject<void> = new Subject();
  public OnGetSessionError$: Observable<void> = this.onGetSessionError$.asObservable();
  private useSentry = false;

  constructor(
    private translate: TranslateService,
    private alert: AlertService,
    private settings: SettingsService
  ) {

    const sentryAddress = this.settings.SentryAddress();

    if (sentryAddress) {
      Language.init(this.translate);
      Sentry.init({
        dsn: sentryAddress
      });
      this.useSentry = true;
    }

  }

  register(err: any, hideAlert?: boolean, reloadAfterClose?: boolean) {

    // Всегда выводим в консоль

    console.error(err);

    // При ошибки авторизации выходим из программы

    if (typeof err === "object" && "error" in err) {

      const sessionErrorCodes = ['noUserSession', 'userSessionClose', 'noKeySession', 'errorKeySession', 'errorDoubleAuthorization'];
      if (sessionErrorCodes.indexOf(err.error) > -1) {
        this.onGetSessionError$.next();
        return;
      }

    }

    // Показываем ошибку пользователю

    if (this.useSentry) {

      const nativeError: Error = (() => {

        if (err && err.stack && err.message) {
          return err;
        }
        if (typeof err === "object") {
          return new Error(JSON.stringify(err));
        }
        if (typeof err === "string") {
          return new Error(err);
        }
        return new Error(String(err));

      })();

      const eventId = Sentry.captureException((nativeError as any).originalError || nativeError);

      if (this.settings.DisplaySentryDialog() && !hideAlert) {

        this.translate.get([
          'SENTRY.title',
          'SENTRY.subtitle',
          'SENTRY.subtitle2',
          'SENTRY.labelName',
          'SENTRY.labelEmail',
          'SENTRY.labelComments',
          'SENTRY.labelClose',
          'SENTRY.labelSubmit',
          'SENTRY.errorGeneric',
          'SENTRY.errorFormEntry',
          'SENTRY.successMessage',
        ]).subscribe((terms: any) => {
          Sentry.showReportDialog({
            eventId: eventId,
            title: terms["SENTRY.title"],
            subtitle: terms["SENTRY.subtitle"],
            subtitle2: terms["SENTRY.subtitle2"],
            labelName: terms["SENTRY.labelName"],
            labelEmail: terms["SENTRY.labelEmail"],
            labelComments: terms["SENTRY.labelComments"],
            labelClose: terms["SENTRY.labelClose"],
            labelSubmit: terms["SENTRY.labelSubmit"],
            errorGeneric: terms["SENTRY.errorGeneric"],
            errorFormEntry: terms["SENTRY.errorFormEntry"],
            successMessage: terms["SENTRY.successMessage"],
          });
        });

        return; // Диалог кабинета не показываем

      }

    }

    if (typeof err === "object" && "error" in err) {

      const message$ = this.messageByCode(err.error, err);
      const title$ = ('title' in err) ? of(err.title) : this.translate.get("ALERT.ERROR_TITLE");

      zip(message$, title$).subscribe(
        (response) => {
          const message = response[0];
          const title = response[1];
          if (message) {
            if (hideAlert) {
              console.error(message);
            } else {
              this.alert.Open({
                text: message,
                title: title,
                reloadAfterClose: (reloadAfterClose) ? reloadAfterClose : false
              });
            }
          }
        },
        (err2) => {
          console.error(err2);
        }
      );

    }


  }

  messageByCode(code: string, err?: AnyObject): Observable<string> {
    const translateKey: string = "ERRORS." + code;
    const params: AnyObject = (typeof err === 'object' && 'parameters' in err && typeof err.parameters === 'object')
       ? err.parameters : undefined;
    return this.translate.get(translateKey, params).pipe(map((value) => {
      if (value === translateKey) {
        if (err && 'message' in err) {
          return err.message;
        }
        return "";
      }
      return value;
    }));
  }

}
