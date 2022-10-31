import { Component } from '@angular/core';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { ForumService } from '../forum.service';
import { takeUntil } from 'rxjs/operators';
import { AppComponentTemplate } from '@shared/component.template';
import { ForumsData, ForumTopicData, ForumData } from '../forum.interface';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '@modules/auth/auth.service';

@Component({
  selector: 'app-forum-list',
  templateUrl: './forum-list.component.html',
  styleUrls: ['./forum-list.component.scss']
})
export class ForumListComponent extends AppComponentTemplate {

  isLoading = false;
  forumsData: ForumsData = [];

  modalNewTopicManager = new BehaviorSubject<boolean>(false);
  modalNewTopicResultsVisibility = false;
  modalNewTopicResultsSelectedCategory: ForumData = null;

  _auth: AuthService;

  constructor(
    private forum: ForumService,
    private err: ErrorsService,
    private router: Router,
    private auth: AuthService
  ) {
    super();
    this._auth = this.auth;
  }

  ngOnInit() {

    this.getTopics();

    this.modalNewTopicManager
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (modalStatus) => {
          this.modalNewTopicResultsVisibility = modalStatus;
        },
        (err) => this.err.register(err)
      );

    this.forum.afterSendNewMessage$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      () => {
        this.modalNewTopicManager.next(false);
        this.getTopics();
      },
      (err) => this.err.register(err)
    );

  }

  getTopics() {
    this.isLoading = true;
    this.forum.forumsData$().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => this.forumsData = response,
      (err) => this.err.register(err),
      () => this.isLoading = false
    );
  }

  createNewTopic(category: ForumData): false {
    this.modalNewTopicResultsSelectedCategory = category;
    this.modalNewTopicManager.next(true);
    return false;
  }

  currentDate(): Date {
    return new Date();
  }

  openTopic(topic: ForumTopicData) {
    this.router.navigate(['/forum', 'topic', topic.object.id]);
  }

}
