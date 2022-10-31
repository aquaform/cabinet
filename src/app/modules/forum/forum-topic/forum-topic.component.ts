import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { MessageData, TopicData } from '../forum.interface';
import { ForumService } from '../forum.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-forum-topic',
  templateUrl: './forum-topic.component.html',
  styleUrls: ['./forum-topic.component.scss']
})
export class ForumTopicComponent extends AppComponentTemplate {

  topicData: TopicData;

  private _currentTopic = "";

  @Input() set currentTopic(val: string) {
    this._currentTopic = val;
    this.getMessages();
  }

  get currentTopic() {
    return this._currentTopic;
  }

  @Output() emitTopicData = new EventEmitter<TopicData>();

  isLoading = false;

  constructor(
    private forum: ForumService,
    private err: ErrorsService,
  ) {
    super();
  }

  ngOnInit() {
    this.forum.afterDeleteMessage$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (deletedMessageId) => {
        const deleteMessage = (messages: MessageData[]): MessageData[] => {
          messages = messages.filter(val => val.id !== deletedMessageId);
          for (const message of messages) {
            if (message.children && message.children.length) {
              message.children = deleteMessage(message.children);
            }
          }
          return messages;
        }
        this.topicData.messages = deleteMessage(this.topicData.messages);
      },
      (err) => this.err.register(err)
    );
  }

  private getMessages() {

    this.isLoading = true;

    this.forum.topicData$(this.currentTopic)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          this.topicData = response;
          this.emitTopicData.emit(this.topicData);
          this.saveDateView();
        },
        (err) => this.err.register(err),
        () => this.isLoading = false
      );

  }

  saveDateView() {
    this.forum.saveDateView$(this.currentTopic).subscribe(
      (response) => { },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );
  }

}
