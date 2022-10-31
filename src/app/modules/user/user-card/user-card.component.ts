import { Component, Input } from '@angular/core';
import { UserCardInputData, UserCardDescription, UserDescription } from '../user.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { takeUntil, map, tap, concatMap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { UserService } from '../user.service';
import { SettingsService } from '@modules/root/settings/settings.service';
import { I18nDataService } from '@modules/root/i18n/i18n-data.service';
import { Observable } from 'rxjs';
import { MessagesService } from '@modules/messages/messages.service';
import { authPermissionNames } from '@modules/auth/auth.interface';
import { YoutubeTools } from '@modules/root/youtube/youtube.class';
import { LocationTools } from '@modules/root/location/location.class';

interface Property {
  name: string;
  value: string;
  isText: boolean;
  isEmail: boolean;
  isLink: boolean;
  isBoolean: boolean;
  isSecondary: boolean;
}

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent extends AppComponentTemplate {

  @Input() data: UserCardInputData = {
    id: "",
    name: ""
  };

  isLoading = false;
  card: UserCardDescription = null;
  settingsService = this.settings;
  properties: Property[] = [];

  videoURL = "";
  youtubeURL = "";

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private err: ErrorsService,
    private user: UserService,
    private settings: SettingsService,
    private i18nData: I18nDataService,
    private messages: MessagesService,
  ) {
    super();
  }

  ngOnInit() {
    this.getData();
  }

  primaryProperties(): Property[] {
    return this.properties.filter(val => !val.isSecondary);
  }

  secondaryProperties(): Property[] {
    return this.properties.filter(val => val.isSecondary);
  }

  getData() {

    this.isLoading = true;
    this.card = null;
    this.properties = [];
    this.getCard()
      .pipe(concatMap((card) => this.translateProperties(card)))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response) => {
          this.addCard(response);
        },
        error: (err) => this.err.register(err),
        complete: () => this.isLoading = false
      });
  }

  addCard(card: UserCardDescription) {
    this.card = card;
    this.processCardElements(this.card, undefined, undefined, (element: Property) => {
      this.properties.push(element);
    });
    if (environment.displayLog) {
      console.log("Translated user card description:", this.card);
      console.log("Translated user card properties:", this.properties);
    }
  }

  getCard(): Observable<UserCardDescription> {
    return this.api.Get<UserCardDescription>(
      `usersCatalog/${this.data.id}/description`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      UserCardDescription,
      APIDataTypes.json
    ).pipe(
      takeUntil(this.ngUnsubscribe),
      tap((response) => {
        if (environment.displayLog) {
          console.log("User card description:", response);
        }
      })
    );
  }

  processCardElements(
    card: UserCardDescription,
    processFn?: (value: any) => any,
    replaceFn?: (value: any) => any,
    getFn?: (value: Property) => any) {

    if (card.additionalInformation) {
      for (const element of card.additionalInformation) {
        if (processFn) {
          processFn(element.name);
        }
        if (replaceFn) {
          element.name = replaceFn(element.name);
        }
        if (getFn) {
          const property: Property = {
            name: element.name,
            value: element.getValue,
            isText: element.isText,
            isEmail: element.isEmail,
            isLink: element.isLink,
            isBoolean: element.isBoolean,
            isSecondary: false
          };
          getFn(property);
        }
      }
    }

    if (card.contactInformation) {
      for (const element of card.contactInformation) {
        if (processFn) {
          processFn(element.kindName);
        }
        if (replaceFn) {
          element.kindName = replaceFn(element.kindName);
        }
        if (getFn) {
          if (element.isVideo) {
            this.videoURL = element.representation;
            continue;
          }
          if (element.isYoutube) {
            this.youtubeURL = YoutubeTools.getVideoID(element.representation);
            continue;
          }
          if (!element.representation) {
            continue;
          }
          const property: Property = {
            name: element.kindName,
            value: element.getValue,
            isText: element.isText,
            isEmail: element.isEmail,
            isLink: element.isLink,
            isBoolean: element.isBoolean,
            isSecondary: false
          };
          getFn(property);
        }
      }
    }

    if (card.studentInformation) {
      for (const element of card.studentInformation.properties) {
        if (!element.value) {
          continue;
        }
        if (processFn) {
          processFn(element.propertyName);
        }
        if (replaceFn) {
          element.propertyName = replaceFn(element.propertyName);
        }
        if (getFn) {
          const property: Property = {
            name: (element.title) ? element.title : element.propertyName,
            value: element.value,
            isText: true,
            isEmail: false,
            isLink: false,
            isBoolean: false,
            isSecondary: true
          };
          getFn(property);
        }
      }
    }

  }

  translateProperties(card: UserCardDescription): Observable<UserCardDescription> {

    const terms: string[] = [];

    this.processCardElements(card, (elementName: string) => {
      terms.push(elementName);
    });

    return this.i18nData.Translate(terms)
      .pipe(map((translated) => {
        this.processCardElements(card, undefined, (elementName: string) => {
          return translated[elementName];
        });
        return card;
      }));

  }

  close(): false {
    this.user.Close();
    return false;
  }

  newMessage() {
    this.close();
    const user: UserDescription = new UserDescription();
    user.id = this.data.id;
    user.name = this.data.name;
    this.messages.DisplayNewMessageForm(user);
  }

  displayNewMessageButton(): boolean {
    return this.auth.IsPermission(authPermissionNames.messages)
      && this.auth?.getUserDescription().id !== this.data.id;
  }

  getYoutubeVideoURL() {
    return YoutubeTools.videoURL(this.youtubeURL, false);
  }

  URLWithoutProtocol(url: string) {
    return LocationTools.URLWithoutProtocol(url);
  }

}
