import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import {
  TopicListDescription,
  NewMessageFormData,
  MessagePageType,
  messagePageTypes,
  MessageListDescription,
  MessageFile,
} from '../messages.interface';
import { MessagesService } from '../messages.service';
import { AfterSelectFileData, } from '@modules/root/upload/upload.interface';
import { takeUntil } from 'rxjs/operators';
import { AppComponentTemplate } from '@shared/component.template';
import { AuthService } from '@modules/auth/auth.service';
import { environment } from '@environments/environment';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { SettingsService } from '@modules/root/settings/settings.service';
import { UserService } from '@modules/user/user.service';
import { Router } from '@angular/router';
import { UserDescription } from '@modules/user/user.interface';
import { DatesTools } from '@modules/root/dates/dates.class';


@Component({
  selector: 'app-messages-topic',
  templateUrl: './messages-topic.component.html',
  styleUrls: ['./messages-topic.component.scss']
})
export class MessagesTopicComponent extends AppComponentTemplate {

  topicData: TopicListDescription;

  private _currentTopic = "";

  @Input() set currentTopic(val: string) {
    this._currentTopic = val;
    this.getData();
  }

  get currentTopic() {
    return this._currentTopic;
  }

  @Input() currentPage: MessagePageType;
  pageTypes = messagePageTypes;

  newMessageForm: NewMessageFormData;

  isLoading = false;
  _settings = this.settings;
  @ViewChild('scrollTo', { static: false }) scrollToElement: ElementRef;

  constructor(
    private messages: MessagesService,
    private auth: AuthService,
    private err: ErrorsService,
    private settings: SettingsService,
    private user: UserService,
    private router: Router
  ) {

    super();
    this.clearNewMessageForm();

  }

  getData() {
    this.isLoading = true;
    this.messages.Topic$(this.currentTopic).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {

        this.topicData = (response && response.length) ? response[0] : null;
        DatesTools.sortByDate(this.topicData.messages, el => el.date, false, false);

        setTimeout(() => {
          if (!this.scrollToElement) {
            return;
          }
          this.scrollToElement.nativeElement.scrollIntoView(false);
        }, 100);

        this.saveDateView();

      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );
  }

  saveDateView() {
    this.messages.SaveDateView$(this.topicData).subscribe(
      (response) => { },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );
  }

  afterSelectFile(data: AfterSelectFileData) {
    this.newMessageForm.files.push(data.file);
  }

  clearNewMessageForm() {
    this.newMessageForm = {
      text: "",
      files: [],
      isSaving: false,
      validate: function () {
        return !!this.text;
      }
    };
  }

  sendNewMessage() {

    if (!this.newMessageForm.validate()) {
      return;
    }

    this.newMessageForm.isSaving = true;

    this.messages.SendNewMessage$(
      this.newMessageForm,
      this.currentTopic,
      this.topicData.lastCompanionMessage(this.auth.getUserDescription()).id,
      "",
      "",
      ""
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(

      (response) => {

        if (environment.displayLog) {
          console.log("New message result:", response);
        }

        const newMessage: MessageListDescription = new MessageListDescription();
        newMessage.id = response.message;
        newMessage.date = new Date();
        newMessage.dateView = newMessage.date;
        newMessage.haveAttachments = !!(response.uploadedFiles && response.uploadedFiles.length);
        newMessage.author = this.auth.getUserDescription();
        newMessage.addressee = this.topicData.companion(this.auth.getUserDescription());
        newMessage.text = this.newMessageForm.text;

        if (newMessage.haveAttachments) {
          newMessage.files = {
            file: []
          };
          for (const uploadedFile of response.uploadedFiles) {
            const newFile: MessageFile = {
              name: uploadedFile.name,
              id: uploadedFile.ref,
              extension: uploadedFile.extension
            };
            newMessage.files.file.push(newFile);
          }
        }

        this.topicData.messages.push(newMessage);

      },
      (err) => this.err.register(err),
      () => this.clearNewMessageForm()
    );

  }

  openCompanion() {
    const user = this.companion();
    this.user.Open(user.id, user.name);
  }

  openUser(user: UserDescription) {
    this.user.Open(user.id, user.name);
  }

  deleteOrRestoreTopic() {
    const deleteValue: boolean = (this.currentPage === this.pageTypes.trash) ? false : true;
    this.messages.DeleteOrRestoreTopic$(this.topicData, deleteValue).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        this.goToList();
      },
      (err) => this.err.register(err)
    );
  }

  companion(): UserDescription {
    return this.topicData.companion(this.auth.getUserDescription());
  }

  companionAvatar(): string {
    return this.companion().pathToAvatar(this.settings);
  }

  goToList() {
    this.router.navigate(['/messages', this.currentPage]);
  }

  deleteAttachedFile(file: File) {
    this.newMessageForm.files = this.newMessageForm.files.filter(val => val !== file);
  }

  isNewMessage(message: MessageListDescription): boolean {
    return message.isNew(this.auth.getUserDescription());
  }

}
