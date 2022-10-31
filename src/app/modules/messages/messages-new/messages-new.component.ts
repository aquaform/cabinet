import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { NewMessageInputData, NewMessageFormData } from '../messages.interface';
import { MessagesService } from '../messages.service';
import { AfterSelectFileData } from '@modules/root/upload/upload.interface';
import { takeUntil } from 'rxjs/operators';
import { AppComponentTemplate } from '@shared/component.template';
import { environment } from '@environments/environment';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { Observable } from 'rxjs';
import { AuthService } from '@modules/auth/auth.service';

@Component({
  selector: 'app-messages-new',
  templateUrl: './messages-new.component.html',
  styleUrls: ['./messages-new.component.scss']
})
export class MessagesNewComponent extends AppComponentTemplate {

  @Input() data: NewMessageInputData = {
    id: "",
    name: "",
    toUser: false,
    toProvidingEducation: false
  };

  newMessageFormData: NewMessageFormData;

  @ViewChild('focusToThis', { static: true }) focusToThisElement: ElementRef;
  isEditorAutofocus = false;

  constructor(
    private messages: MessagesService,
    private err: ErrorsService,
    private auth: AuthService
  ) {
    super();

  }

  ngOnInit() {
    if (environment.displayLog) {
      console.log("New message initial form data:", this.data);
    }

    this.clearNewMessageForm();

    if (this.data.name
      && 'topicName' in this.newMessageFormData
      && !this.newMessageFormData.topicName
      && !this.data.toUser) {

      this.newMessageFormData.topicName = this.data.name;
      this.isEditorAutofocus = true;

    } else {

      if (this.focusToThisElement) {
        this.focusToThisElement.nativeElement.focus();
      }

    }
  }

  clearNewMessageForm() {

    const newText = (this.data?.toProvidingEducation) ? `
      <p><br/></p>
      <p>---</p>
      <p>${this.auth.getUserDescription().name}</p>` : "";

    this.newMessageFormData = {
      text: newText,
      files: [],
      isSaving: false,
      topicName: "",
      validate: function () {
        return (this.text && this.topicName);
      }
    };

  }

  close() {
    this.messages.CloseNewMessageForm();
  }

  afterSelectFile(data: AfterSelectFileData) {
    this.newMessageFormData.files.push(data.file);
  }

  sendNewMessage() {

    if (!this.newMessageFormData.validate()) {
      return;
    }

    this.newMessageFormData.isSaving = true;

    const provider$: Observable<any> = (() => {

      if (this.data.toUser) {
        return this.messages.SendNewMessage$(
          this.newMessageFormData,
          "",
          "",
          this.data.id,
          "user",
          "toUser");
      }

      if (this.data.toProvidingEducation) {
        return this.messages.SendNewMassMessage$(
          this.newMessageFormData,
          this.data.id);
      }

    })();

    provider$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("New message result:", response);
        }
      },
      (err) => this.err.register(err),
      () => {
        this.clearNewMessageForm();
        this.close();
      }
    );

  }

  deleteAttachedFile(file: File) {
    this.newMessageFormData.files = this.newMessageFormData.files.filter(val => val !== file);
  }

}
