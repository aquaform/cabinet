import { Component, HostBinding } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '@modules/root/i18n/i18n.class';
import { AppComponentTemplate } from '@shared/component.template';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { TopicData } from '@modules/forum/forum.interface';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss']
})
export class ForumComponent extends AppComponentTemplate {

  @HostBinding('class.page-host') isPage = true;

  currentTopic = "";
  currentTopicData: TopicData;

  constructor(
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {

    super();
    Language.init(this.translate);

  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
        this.currentTopic = (params.topic) ? params.topic : "";
        if (!this.currentTopic) {
          this.currentTopicData = null;
        }
      });
  }

  goToForum() {
    this.router.navigate(['/forum']);
  }

  setTopicData(topicData: TopicData) {
    this.currentTopicData = topicData;
  }

}
