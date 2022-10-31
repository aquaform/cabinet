import { Component } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { NewsResponseData, NewsDescription, NewsTextResponse, SaveViewDateRequest, SaveViewDateResponse } from '../news.interface';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { SettingsService } from '@modules/root/settings/settings.service';
import { DatesTools } from '@modules/root/dates/dates.class';
import { NotificationsService } from '@modules/root/notifications/notifications.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent extends AppComponentTemplate {

  isLoading = false;

  news: NewsDescription[] = [];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
    private settings: SettingsService,
    private notifications: NotificationsService) {

      super();

  }

  ngOnInit() {

    this.getData();

    this.notifications.GetData$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          if (response && response.countNewNews > 0) {
            this.saveViewDate();
          }
        },
        (err) => this.err.register(err),
      );

  }

  getData() {

    this.isLoading = true;
    this.news = [];

    const endDate = new Date();
    const startDate = DatesTools.addDays(new Date(), this.settings.News().fromLastDays * -1);

    this.api.Get<NewsResponseData>(
      `news/get/${startDate.getTime()}/${endDate.getTime()}/0`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      NewsResponseData
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {

        if (environment.displayLog) {
          console.log("News:", response);
        }

        if (!response) {
          return;
        }

        this.news = response.map((val) => val.object);
        DatesTools.sortByDate<NewsDescription>(
            this.news, (el) => el.datePublication, true, false, (el) => el.pin);

      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );

  }

  getText(element: NewsDescription) {

    if (element.textDescription) {
      element.textDescription = null;
      return;
    }

    element.textDescriptionIsLoading = true;

    this.api.Get<NewsTextResponse>(
      `news/${element.id}/text`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      NewsTextResponse,
      APIDataTypes.xml
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {

        if (environment.displayLog) {
          console.log("News text:", response);
        }

        if (!response) {
          return;
        }

        element.textDescription = response.response.newsItem;



      },
      (err) => this.err.register(err),
      () => element.textDescriptionIsLoading = false
    );

  }

  saveViewDate() {

    const requestData: SaveViewDateRequest = {
      dateView: new Date().getTime()
    };

    this.api.Get<SaveViewDateResponse>(
      `news/settings/save`,
      requestData,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      SaveViewDateResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {

        if (environment.displayLog) {
          console.log("Save news date view:", response);
        }

      },
      (err) => this.err.register(err)
    );

  }

}
