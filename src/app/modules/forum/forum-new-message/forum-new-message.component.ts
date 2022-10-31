import { Component, Input } from '@angular/core';
import { NewForumMessageFormData, MessageData } from '../forum.interface';
import { AfterSelectFileData } from '@modules/root/upload/upload.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { ForumService } from '../forum.service';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ErrorsService } from '@modules/root/errors/errors.service';

@Component({
  selector: 'app-forum-new-message',
  templateUrl: './forum-new-message.component.html',
  styleUrls: ['./forum-new-message.component.scss']
})
export class ForumNewMessageComponent extends AppComponentTemplate {

  @Input() topic: string;
  @Input() replyToMessage: string;
  @Input() messagesList: MessageData[];
  @Input() category: string;

  newMessageFormData: NewForumMessageFormData;

  constructor(
    private forum: ForumService,
    private err: ErrorsService,
  ) {
    super();
    this.clearNewMessageForm();
  }

  ngOnInit() {
  }

  sendNewMessage() {

    this.newMessageFormData.isSaving = true;

    this.forum.sendNewMessage$(
      this.newMessageFormData,
      this.topic,
      this.replyToMessage,
      (this.category) ? this.newMessageFormData.topicName : "",
      (this.category) ? "toForum" : "",
      (this.category) ? this.category : "",
      (this.category) ? "forumCategory" : "")
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        (response) => {
          if (environment.displayLog) {
            console.log("New forum message result:", response);
          }
          if (this.messagesList) {
            this.messagesList.push(response);
          }
        },
        (err) => this.err.register(err),
        () => {
          this.clearNewMessageForm();
        }
      );

  }

  clearNewMessageForm() {
    this.newMessageFormData = {
      text: "",
      files: [],
      isSaving: false,
      topicName: "",
      validate: function () {
        if (this.text) {
          return true;
        }
        return false;
      }
    };
  }

  afterSelectFile(data: AfterSelectFileData) {
    this.newMessageFormData.files.push(data.file);
  }

  deleteAttachedFile(file: File) {
    this.newMessageFormData.files = this.newMessageFormData.files.filter(val => val !== file);
  }


}
