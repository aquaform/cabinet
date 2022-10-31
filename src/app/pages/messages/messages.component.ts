import { Component, HostBinding} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '@modules/root/i18n/i18n.class';
import { takeUntil } from 'rxjs/operators';
import { AppComponentTemplate } from '@shared/component.template';
import { ActivatedRoute } from '@angular/router';
import { MessagePageType } from '@modules/messages/messages.interface';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent extends AppComponentTemplate {

  @HostBinding('class.page-host') isPage = true;

  currentTopic = "";
  currentPage: MessagePageType;

  constructor(
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute) {
    super();
    Language.init(this.translate);
  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
        this.currentTopic = (params.topic) ? params.topic : "";
        this.currentPage = (params.page) ? params.page : "incoming";
      });
  }

}
