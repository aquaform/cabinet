import { Component, Input } from '@angular/core';
import { MessagesService } from '../messages.service';
import { AppComponentTemplate } from '@shared/component.template';
import { takeUntil } from 'rxjs/operators';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { TopicListDescription, messagePageTypes, MessagePageType } from '../messages.interface';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '@modules/auth/auth.service';
import { SettingsService } from '@modules/root/settings/settings.service';
import { UserDescription } from '@modules/user/user.interface';
import { UserService } from '@modules/user/user.service';

interface PageDescription {
  type: MessagePageType;
  name: string;
  isLoading: boolean;
  topics: TopicListDescription[];
  ready: boolean;
  getData$: (onlyLast: boolean) => Observable<TopicListDescription[]>;
  onlyMobile: boolean;
  onlyLast: boolean;
}

@Component({
  selector: 'app-messages-list',
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.scss']
})
export class MessagesListComponent extends AppComponentTemplate {

  pageTypes = messagePageTypes;

  private _currentPage: MessagePageType;

  @Input() set currentPage(val: MessagePageType) {
    if (!val) {
      return;
    }
    this._currentPage = val;
    this.getPageTopics();
  }

  get currentPage(): MessagePageType {
    return this._currentPage;
  }

  pages: PageDescription[] = [
    {
      type: this.pageTypes.contacts,
      name: "",
      isLoading: false,
      ready: false,
      topics: [],
      getData$: null,
      onlyMobile: true,
      onlyLast: true
    },
    {
      type: this.pageTypes.incoming,
      name: "",
      isLoading: false,
      ready: false,
      topics: [],
      getData$: (onlyLast: boolean) => this.messages.Incoming$(onlyLast),
      onlyMobile: false,
      onlyLast: true
    },
    {
      type: this.pageTypes.outgoing,
      name: "",
      isLoading: false,
      ready: false,
      topics: [],
      getData$: (onlyLast: boolean) =>  this.messages.Outgoing$(onlyLast),
      onlyMobile: false,
      onlyLast: true
    },
    {
      type: this.pageTypes.trash,
      name: "",
      isLoading: false,
      ready: false,
      topics: [],
      getData$: (onlyLast: boolean) =>  this.messages.Trash$(onlyLast),
      onlyMobile: false,
      onlyLast: true
    },

  ];

  constructor(
    private messages: MessagesService,
    private err: ErrorsService,
    private translate: TranslateService,
    private router: Router,
    private auth: AuthService,
    private settings: SettingsService,
    private user: UserService,
  ) {

    super();
    this.translatePages();

  }

  ngOnInit() {

    this.getPageTopics();
    this.messages.afterSendNewMessage$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      () => this.dropReadyPages(),
      (err) => this.err.register(err)
    );

  }

  translatePages() {
    const pageTypesNames = this.pages.map(val => `MESSAGES.PAGES.${val.type}`);
    this.translate.get(pageTypesNames).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        for (const page of this.pages) {
          page.name = response[`MESSAGES.PAGES.${page.type}`];
        }
      },
      err => this.err.register(err)
    );
  }

  getPageDescription(pageName: MessagePageType): PageDescription {
    return this.pages.find(val => val.type === pageName);
  }

  goToPage(page: PageDescription) {
    this.router.navigate(['/messages', page.type]);
  }

  getPageTopics() {
    const page = this.pages.find(val => val.type === this.currentPage);
    if (!page) {
      return;
    }
    if (page.ready || !page.getData$) {
      return;
    }
    page.isLoading = true;
    page.ready = false;
    page.topics = [];

    page.getData$(page.onlyLast).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        page.topics = response;
        page.ready = true;
        page.isLoading = false;
      },
      (err) => this.err.register(err)
    );
  }

  dropReadyPages() {
    this.pages.forEach(val => {
      val.ready = false;
    });
  }

  openTopic(topic: string) {
    this.router.navigate(['/messages', this.currentPage, 'topic', topic]);
  }

  isNewMessages(topic: TopicListDescription): boolean {
    return topic.isNewCompanionMessages(this.auth.getUserDescription());
  }

  openCompanion(topic: TopicListDescription) {
    const user = this.companion(topic);
    this.user.Open(user.id, user.name);
  }

  deleteOrRestoreTopic(topic: TopicListDescription) {
    const deleteValue: boolean = (this.currentPage === this.pageTypes.trash) ? false : true;
    this.messages.DeleteOrRestoreTopic$(topic, deleteValue).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        const page = this.pages.find(val => val.type === this.currentPage);
        page.topics = page.topics.filter(val => val.id !== response.id);
      },
      (err) => this.err.register(err),
      () => this.dropReadyPages()
    );
  }

  companion(topic: TopicListDescription): UserDescription {
    return topic.companion(this.auth.getUserDescription());
  }

  companionAvatar(topic: TopicListDescription): string {
    return this.companion(topic).pathToAvatar(this.settings);
  }

  displayAll(page: PageDescription): false {
    this.dropReadyPages();
    page.onlyLast = false;
    this.getPageTopics();
    return false;
  }

}
