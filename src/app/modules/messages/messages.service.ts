import { Injectable } from '@angular/core';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import { Observable, of, zip, Subject } from 'rxjs';
import {
  TopicListDescription,
  MessagesDataResponse,
  MessageListDescription,
  MessageUserCatalogResponse,
  MessageUserCatalog,
  MessageUserCatalogGroup,
  MessageUser,
  MessageTextResponse,
  MessageDeleteMessageResponse,
  MessageSaveSettingsRequest,
  NewMessageInputData,
  NewMessageFormData,
  NewMessageResponse,
  NewMessageSendData,
  NewMassMessageSendData,
  NewMassMessageResponse,
} from './messages.interface';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { map, concatMap, tap } from 'rxjs/operators';
import { DatesTools } from '@modules/root/dates/dates.class';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { UserDescription } from '@modules/user/user.interface';
import { ModalService } from '@modules/root/modal/modal.service';
import { FileToUpload } from '@modules/root/upload/upload.interface';
import { fileToBase64 } from '@modules/root/upload/upload.tools';
import { EduTeacherActivityDescription } from '@modules/activities/teacher/teacher.interface';
import { StringsTools } from '@modules/root/strings/strings.class';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private _afterSendNewMessage$ = new Subject<void>();
  afterSendNewMessage$ = this._afterSendNewMessage$.asObservable();

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private translate: TranslateService,
    private modal: ModalService
  ) { }

  private startDate(onlyLast: boolean): number {
    const deductDays: number = (onlyLast) ? 45 : 365;
    return DatesTools.addDays(new Date(), deductDays * -1).getTime();
  }

  private endDate(): number {
    return DatesTools.addDays(new Date(), 1).getTime();
  }

  Incoming$(onlyLast: boolean): Observable<TopicListDescription[]> {
    return this.topics$(`pm/messages/Incoming/${this.startDate(onlyLast)}/${this.endDate()}`);
  }

  Outgoing$(onlyLast: boolean): Observable<TopicListDescription[]> {
    return this.topics$(`pm/messages/Sent/${this.startDate(onlyLast)}/${this.endDate()}`);
  }

  Trash$(onlyLast: boolean): Observable<TopicListDescription[]> {
    return this.topics$(`pm/messages/Trash/${this.startDate(onlyLast)}/${this.endDate()}`);
  }

  Topic$(topicID?: string): Observable<TopicListDescription[]> {

    if (!topicID) {
      return of([]);
    }

    // Получает тексты сообщений отдельными запросами
    // TODO: textMessage
    // Оптимизировать до одного запроса
    const textMessages$ = (topics: TopicListDescription[]): Observable<TopicListDescription[]> => {
      const getTextMessages$: Observable<MessageTextResponse>[] = [];
      const allMessages: MessageListDescription[] = [];
      for (const currentTopic of topics) {
        for (const message of currentTopic.messages) {
          allMessages.push(message);
        }
      }
      allMessages.forEach(message => getTextMessages$.push(this.TextMessage$(message.id)));
      return zip(...getTextMessages$).pipe(map((response) => {
        allMessages.forEach(message => {
          const responseMessage = response[allMessages.indexOf(message)].response.message;
          message.text = responseMessage.text;
          if (!message.files) {
            message.files = {
              file: []
            };
          }
          if (responseMessage.files && responseMessage.files.file) {
            message.files.file = responseMessage.files.file;
          }
        });
        return topics;
      }));
    };

    return this.topics$(`pm/${topicID}/messages`).pipe(concatMap(val => textMessages$(val)));

  }

  private topics$(path: string): Observable<TopicListDescription[]> {
    return this.api.Get<MessagesDataResponse>(
      path,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      MessagesDataResponse
    ).pipe(map((response) => {

      if (environment.displayLog) {
        console.log("Messages raw data:", response);
      }

      const topics: TopicListDescription[] = [];
      if (!response) {
        return topics;
      }

      for (const messageData of response) {

        let topic: TopicListDescription = topics.find(val => val.id === messageData.object.topic);
        if (!topic) {
          topic = new TopicListDescription();
          topic.id = messageData.object.topic;
          topic.name = messageData.object.topicName;
          topic.messages = [];
          topics.push(topic);
        }

        const messageDescription = new MessageListDescription();
        messageDescription.id = messageData.object.id;
        messageDescription.date = messageData.date;
        messageDescription.haveAttachments = messageData.object.haveAttachments;
        messageDescription.author = messageData.object.author;
        messageDescription.addressee = messageData.object.addressee;
        messageDescription.dateView = (messageData.userDescription) ? messageData.userDescription.dateView : null;

        topic.messages.push(messageDescription);

      }

      DatesTools.sortByDate(topics, val => val.lastMessage.date, true, true);

      if (environment.displayLog) {
        console.log("Topics:", topics);
      }

      return topics;

    }));
  }

  UserCatalog$(): Observable<MessageUserCatalog> {

    const data$ = (ORGANIZERS_TITLE: string, TEACHERS_TITLE: string, PARTICIPANTS_TITLE: string): Observable<MessageUserCatalog> => {
      return this.api.Get<MessageUserCatalogResponse>(
        "usersCatalog/get",
        {},
        APIServiceNames.edu,
        this.auth.SearchParams(),
        MessageUserCatalogResponse
      ).pipe(map((response) => {

        if (environment.displayLog) {
          console.log("User catalog raw data:", response);
        }

        const userCatalog = new MessageUserCatalog();
        userCatalog.groups = [];

        if (!response) {
          return;
        }

        if (response.teachers && response.teachers.length) {
          const teachers: MessageUserCatalogGroup = {
            name: TEACHERS_TITLE,
            users: response.teachers.map((user) => {
              const newUser: MessageUser = Object.assign({}, user, { description: "" });
              return newUser;
            })
          };
          userCatalog.groups.push(teachers);
        }

        if (response.organizers && response.organizers.length) {
          const organizers: MessageUserCatalogGroup = {
            name: ORGANIZERS_TITLE,
            users: response.organizers.map((val) => {
              const newUser = new MessageUser();
              newUser.avatar = ""; // TODO organizer avatar
              newUser.description = val.object.description;
              newUser.id = val.object.user;
              newUser.name = val.object.name;
              return newUser;
            })
          };
          userCatalog.groups.push(organizers);
        }

        if (response.eduGroups && response.eduGroups.length) {
          userCatalog.groups = userCatalog.groups.concat(response.eduGroups.map((val) => {
            const newGroup: MessageUserCatalogGroup = {
              name: val.name,
              users: val.participants.map((user) => {
                const newUser: MessageUser = Object.assign({}, user, { description: "" });
                return newUser;
              })
            };
            return newGroup;
          }));
        }

        if (response.participants && response.participants.length) {
          const participants: MessageUserCatalogGroup = {
            name: PARTICIPANTS_TITLE,
            users: response.participants
              .filter((v, i, a) => a.findIndex((val) => val.id === v.id) === i) // Удаляем повторы
              .filter((val) => val.id !== this.auth.getUserDescription().id)
              .map((user) => {
                const newUser: MessageUser = Object.assign({}, user, {
                  description: "",
                });
                return newUser;
              })
          };
          StringsTools.SortArrayByString(participants.users, (val) => val.name);
          userCatalog.groups.push(participants);
        }

        if (environment.displayLog) {
          console.log("User catalog:", userCatalog);
        }

        return userCatalog;

      }));
    };

    const translate$: Observable<string[]> = this.translate.get(["MESSAGES.ORGANIZERS", "MESSAGES.PARTICIPANTS", "MESSAGES.TEACHERS"])
      .pipe(map((val) => [val["MESSAGES.ORGANIZERS"], val["MESSAGES.TEACHERS"], val["MESSAGES.PARTICIPANTS"]]));

    return translate$.pipe(concatMap(strings => data$(strings[0], strings[1], strings[2])));

  }

  TextMessage$(messageID: string): Observable<MessageTextResponse> {

    return this.api.Get<MessageTextResponse>(
      `pm/messages/${messageID}/text`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      MessageTextResponse,
      APIDataTypes.xml
    ).pipe(map((response) => {

      if (environment.displayLog) {
        console.log("Text message raw data:", response);
      }

      return response;

    }));

  }

  SaveDateView$(topic: TopicListDescription): Observable<TopicListDescription> {

    const saveDateViewMessage$ = (messageID: string) => {

      const saveDateViewMessageRequest: MessageSaveSettingsRequest = {
        dateView: new Date(),
      };

      return this.api.Get<MessageDeleteMessageResponse>(
        `communication/messages/${messageID}/settings/save`,
        saveDateViewMessageRequest,
        APIServiceNames.edu,
        this.auth.SearchParams(),
        MessageDeleteMessageResponse,
        APIDataTypes.json
      ).pipe(map((response) => {

        if (environment.displayLog) {
          console.log("After save date view message:", response);
        }

        return response;

      }));

    };

    const allSaveArray = topic.allCompanionMessages(this.auth.getUserDescription())
      .map((val) => saveDateViewMessage$(val.id));

    return zip(...allSaveArray).pipe(map(val => topic));

  }

  DeleteOrRestoreTopic$(topic: TopicListDescription, value: boolean): Observable<TopicListDescription> {

    const deleteMessage$ = (messageID: string) => {

      const deleteMessageRequest: MessageSaveSettingsRequest = {
        dateView: new Date(),
        name: "Deleted",
        value: value
      };

      return this.api.Get<MessageDeleteMessageResponse>(
        `communication/messages/${messageID}/settings/save`,
        deleteMessageRequest,
        APIServiceNames.edu,
        this.auth.SearchParams(),
        MessageDeleteMessageResponse,
        APIDataTypes.json
      ).pipe(map((response) => {

        if (environment.displayLog) {
          console.log("After delete message:", response);
        }

        return response;

      }));

    };

    const allDeleteArray = topic.messages.map((val) => deleteMessage$(val.id));

    return zip(...allDeleteArray).pipe(map(val => topic));

  }



  DisplayNewMessageForm(user?: UserDescription, teacherActivity?: EduTeacherActivityDescription) {

    const modalData: NewMessageInputData = (() => {

      if (user) {
        return {
          id: user.id,
          name: user.name,
          toUser: true,
          toProvidingEducation: false
        };
      }

      if (teacherActivity) {
        return {
          id: teacherActivity.providingEducation,
          name: teacherActivity.name,
          toUser: false,
          toProvidingEducation: true
        };
      }

      throw new Error("Unknown new message form data");

    })();

    this.modal.Display({
      component: "message",
      data: modalData,
      maximizeSize: false
    });

  }

  CloseNewMessageForm() {
    this.modal.Close();
  }

  SendNewMessage$(
    formData: NewMessageFormData,
    topic: string,
    replyTo: string,
    context: string,
    contextType: string,
    addressee: string,
  ): Observable<NewMessageResponse> {

    let filesToUploadFiles$: Observable<FileToUpload[]> = of([]);

    if (formData.files.length) {
      const filesToBase64$: Observable<string>[] = formData.files.map(val => fileToBase64(val));
      filesToUploadFiles$ = zip(...filesToBase64$).pipe(map((base64Data) => {
        const filesToUpload: FileToUpload[] = [];
        for (const file of formData.files) {
          const newFileToUpload: FileToUpload = {
            description: file,
            base64Data: base64Data[formData.files.indexOf(file)]
          };
          filesToUpload.push(newFileToUpload);
        }
        return filesToUpload;
      }));
    }

    const upload$ = (files: FileToUpload[]): Observable<NewMessageResponse> => {

      const dataToSend: NewMessageSendData = {
        context: context,
        contextType: contextType,
        topic: topic,
        addressee: addressee,
        textNewMessage: formData.text,
        textNewTopic: (formData.topicName) ? formData.topicName : "",
        replyTo: replyTo,
        files: files
      };

      return this.api.Get<NewMessageResponse>(
        "communication/messages/new",
        dataToSend,
        APIServiceNames.edu,
        this.auth.SearchParams(),
        NewMessageResponse,
        APIDataTypes.json,
        true
      );

    };

    return filesToUploadFiles$.pipe(concatMap(files => upload$(files))).pipe(tap(() => {
      this._afterSendNewMessage$.next();
    }));

  }

  SendNewMassMessage$(
    formData: NewMessageFormData,
    providingEducation: string,
  ): Observable<NewMassMessageResponse> {

    const dataToSend: NewMassMessageSendData = {
      providingEducation: providingEducation,
      textNewMessage: formData.text,
      textNewTopic: (formData.topicName) ? formData.topicName : "",
    };

    return this.api.Get<NewMassMessageResponse>(
      "communication/mass_message/new",
      dataToSend,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      NewMassMessageResponse,
      APIDataTypes.json,
    ).pipe(tap(() => {
      this._afterSendNewMessage$.next();
    }));

  }

}
