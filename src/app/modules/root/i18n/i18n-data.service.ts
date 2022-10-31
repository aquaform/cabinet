import { Injectable } from '@angular/core';
import { Language, Lang } from './i18n.class';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { I18nDataFile } from './i18n-data.interface';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ErrorsService } from '../errors/errors.service';

interface TranslateResponse {
  [term: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class I18nDataService {

  private fileName = 'user.json';

  data$: Subject<I18nDataFile> = new Subject();
  data: I18nDataFile;

  constructor(
    private translate: TranslateService,
    private http: HttpClient,
    private err: ErrorsService
  ) {

    this.http.get<I18nDataFile>(`./assets/i18n/data/${this.fileName}`).subscribe(
      (response) => {
        this.data = response;
        this.data$.next(response);
      },
      (errData) => this.err.register(errData)
    );

  }

  Translate(terms: string[]): Observable<TranslateResponse> {

    // ВАЖНО! Эта функция может вызываться множество раз через async pipe.
    // Поэтому надо внимательно следить, чтобы в процессе ее выполнения не создавалось
    // множества однотипных запросов к данным.

    const currentLang: Lang = Language.get(this.translate);
    const allLangs: Lang[] = Language.supportedLangs();
    const data$ = (this.data) ? of (this.data) : this.data$;

    return data$.pipe(map((fileData) => {

        const response: TranslateResponse = {};
        const translateTerm = (term: string): string => {
          if (!fileData || !('data' in fileData)) {
            return term;
          }
          const element = fileData.data.find((val) => {
            for (const lang of allLangs) {
              if (val[lang].trim().toLocaleLowerCase() === term.trim().toLocaleLowerCase()) {
                return true;
              }
            }
            return false;
          });
          if (element) {
            return element[currentLang];
          }
          return term;
        };

        for (const term of terms) {
          response[term] = translateTerm(term);
        }

        return response;

      }));

  }

}
