import { Component, Input } from '@angular/core';
import { MessageData, TopicData } from '../forum.interface';
import { SettingsService } from '@modules/root/settings/settings.service';
import { ForumService } from '../forum.service';
import { takeUntil } from 'rxjs/operators';
import { AppComponentTemplate } from '@shared/component.template';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { UserService } from '@modules/user/user.service';
import { QuestionService } from '@modules/root/question/question.service';
import { TranslateService } from '@ngx-translate/core';
import { questionAnswers } from '@modules/root/question/question.interface';
import { AuthService } from '@modules/auth/auth.service';

@Component({
  selector: 'app-forum-message',
  templateUrl: './forum-message.component.html',
  styleUrls: ['./forum-message.component.scss']
})
export class ForumMessageComponent extends AppComponentTemplate {

  @Input() messageData: MessageData;
  @Input() dateView: Date;
  @Input() topicData: TopicData;

  displayReplyForm = false;

  _auth: AuthService;

  constructor(
    private settings: SettingsService,
    private forum: ForumService,
    private err: ErrorsService,
    private user: UserService,
    private question: QuestionService,
    private translate: TranslateService,
    private auth: AuthService
  ) {
    super();
    this._auth = this.auth;
  }

  ngOnInit() {
    this.forum.afterSendNewMessage$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      () => this.displayReplyForm = false,
      (err) => this.err.register(err)
    );
  }

  userAvatar(): string {
    return this.messageData.author.pathToAvatar(this.settings);
  }

  currentDate(): Date {
    return new Date();
  }

  changeDisplayReplyForm() {
    this.displayReplyForm = !this.displayReplyForm;
  }

  displayUser() {
    this.user.Open(this.messageData.author.id, this.messageData.author.name);
  }

  availableReply(): boolean {
    return this.messageData.author.id !== this.auth.getUserDescription().id;
  }

  availableDelete(): boolean {
    const availableModeration = this.topicData.category.moderationIsAvailable(this._auth);
    const isAuthor = this.messageData.author.id === this.auth.getUserDescription().id;
    return availableModeration || isAuthor;
  }

  readonlyDelete(): boolean {
    const isChildren: boolean = (this.messageData.children && this.messageData.children.length) ? true : false;
    return isChildren;
  }

  startDeleteMessage() {

    if (!this.availableDelete() || this.readonlyDelete()) {
      return;
    }

      this.translate.get('FORUM.DELETE_QUESTION').subscribe(
        (text) => {
          this.question.Open({text: text}).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
            (result) => {
              if (result === questionAnswers.yes) {
                this.deleteMessage();
              }
            },
            (err) => this.err.register(err)
          );
        }
      );

  }

  deleteMessage() {
    this.forum.deleteMessage$(this.messageData.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      () => {},
      (err) => this.err.register(err)
    );
  }

}
