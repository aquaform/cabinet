import { Injectable } from '@angular/core';
import { Subject, Observable, of, zip } from 'rxjs';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import {
  ForumCategoriesDataResponse,
  ForumTopicsDataResponse,
  ForumData,
  ForumsData,
  TopicData,
  MessagesFromBaseResponse,
  MessageFromBaseData,
  MessageData,
  ForumTopicData,
  NewForumMessageFormData,
  NewForumMessageResponse,
  NewForumMessageSendData,
  ForumMessageSaveSettingsRequest,
  ForumMessageSaveSettingsResponse,
  ForumTopicsDataRequest,
  MessageFile, ForumDeleteMessageResponse
} from './forum.interface';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { map, concatMap, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { FileToUpload } from '@modules/root/upload/upload.interface';
import { fileToBase64 } from '@modules/root/upload/upload.tools';
import { DatesTools } from '@modules/root/dates/dates.class';

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  private _afterSendNewMessage$ = new Subject<MessageData>();
  afterSendNewMessage$ = this._afterSendNewMessage$.asObservable();

  private _afterDeleteMessage$ = new Subject<string>();
  afterDeleteMessage$ = this._afterDeleteMessage$.asObservable();

  private _forumsData: ForumsData;

  constructor(
    private api: ApiService,
    private auth: AuthService,
  ) { }

  // Получает данные форума
  //
  forumsData$(): Observable<ForumsData> {

    if (this._forumsData) {

      return of(this._forumsData);

    } else {

      return this.categories$().pipe(map((categoriesData) => {
        return categoriesData.sort((element1, element2) => {
          return (element1.object.number > element2.object.number) ? 1 : -1;
        });;
      })).pipe(concatMap(
        categoriesData => this.topics$(categoriesData).pipe(map(
          topicsData => this.forumsDataFromServerData(categoriesData, topicsData)
        ))
      )).pipe(tap((forumsData) => {
        this._forumsData = forumsData;
        if (environment.displayLog) {
          console.log("Forums data:", forumsData);
        }
      }));

    }

  }

  // Получает сообщения темы
  //
  topicData$(topic: string): Observable<TopicData> {
    return zip(this.messages$(topic), this.forumsData$()).pipe(map((zipData) => {

      const messagesFromBase = zipData[0];
      const forumFromBase = zipData[1];

      let thisTopicData: ForumTopicData = null;
      let thisCategory: ForumData = null;

      for (const category of forumFromBase) {
        for (const currentTopic of category.topics) {
          if (currentTopic.object.id === topic) {
            thisTopicData = currentTopic;
            thisCategory = category;
            break;
          }
        }
      }

      const getMessageData = (messageFromBase: MessageFromBaseData): MessageData => {

        const messageData: MessageData = {
          id: messageFromBase._attributes.id,
          author: messageFromBase.author,
          isAttachedFiles: messageFromBase.isAttachedFiles,
          date: messageFromBase.timeStamp,
          text: messageFromBase.text,
          topic: thisTopicData.object.id,
          files: (messageFromBase.files && messageFromBase.files.file) ? messageFromBase.files.file : [],
          children: messagesFromBase.response.message
            .filter(val => val._attributes.numParentMessage === messageFromBase._attributes.number)
            .map(val => getMessageData(val))
        };

        return messageData;

      };


      const topicData: TopicData = {
        messages: messagesFromBase.response.message
          .filter(val => !val._attributes.numParentMessage)
          .map(val => getMessageData(val)),
        topic: thisTopicData,
        category: thisCategory
      };

      DatesTools.sortByDate<MessageData>(
        topicData.messages, (el) => el.date, false, false);

      return topicData;

    })).pipe(tap((topicData) => {
      if (environment.displayLog) {
        console.log("Topic data:", topicData);
      }
    }));
  }

  // Отправляет сообщение форума
  //
  sendNewMessage$(
    formData: NewForumMessageFormData,
    topic: string,
    replyTo: string,
    textNewTopic: string,
    addressee: string,
    context: string,
    contextType: string
  ): Observable<MessageData> {

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

    const upload$ = (files: FileToUpload[]): Observable<NewForumMessageResponse> => {

      const dataToSend: NewForumMessageSendData = {
        topic: (topic) ? topic : "",
        textNewMessage: formData.text,
        replyTo: (replyTo) ? replyTo : "",
        files: files,
        textNewTopic: textNewTopic,
        addressee: addressee,
        context: context,
        contextType: contextType
      };

      return this.api.Get<NewForumMessageResponse>(
        "communication/messages/new",
        dataToSend,
        APIServiceNames.edu,
        this.auth.SearchParams(),
        NewForumMessageResponse,
        APIDataTypes.json,
        true
      );

    };

    return filesToUploadFiles$.pipe(concatMap(files => upload$(files))).pipe(map((response) => {

      const newMessageData: MessageData = {
        id: response.message,
        author: this.auth.getUserDescription(),
        isAttachedFiles: !!(response.uploadedFiles && response.uploadedFiles.length),
        files: [],
        date: new Date(),
        text: "<p>" + formData.text + "</p>",
        children: [],
        topic: topic
      };

      if (response && response.uploadedFiles) {
        newMessageData.files = response.uploadedFiles.map(val => {
          const fileDescription: MessageFile = {
            name: val.name,
            id: val.ref,
            extension: val.extension
          };
          return fileDescription;
        });
      }

      this._forumsData = null; // Сбрасываем кеш
      this._afterSendNewMessage$.next(newMessageData);

      return newMessageData;

    }));

  }

  // Записывает дату просмотра темы
  //
  saveDateView$(topic: string): Observable<ForumMessageSaveSettingsResponse> {

    const saveDateViewMessageRequest: ForumMessageSaveSettingsRequest = {
      dateView: new Date(),
    };

    return this.api.Get<ForumMessageSaveSettingsResponse>(
      `communication/topics/${topic}/settings/save`,
      saveDateViewMessageRequest,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      ForumMessageSaveSettingsResponse,
      APIDataTypes.json
    ).pipe(map((response) => {
      if (environment.displayLog) {
        console.log("After save date view forum topic:", response);
      }
      this._forumsData = null;
      return response;
    }));

  }

  // Удаляет сообщение
  //
  deleteMessage$(messageId: string): Observable<ForumDeleteMessageResponse> {
    return this.api.Get<ForumDeleteMessageResponse>(
      `/forum/messages/${messageId}/delete`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      ForumDeleteMessageResponse
    ).pipe(map((response) => {
      if (environment.displayLog) {
        console.log("Delete forum message response:", response);
      }
      this._afterDeleteMessage$.next(messageId);
      return response;
    }));
  }

  // Получает список категорий форума
  //
  private categories$(): Observable<ForumCategoriesDataResponse> {
    return this.api.Get<ForumCategoriesDataResponse>(
      'forum/categories',
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      ForumCategoriesDataResponse
    ).pipe(map((response) => {
      if (environment.displayLog) {
        console.log("Forum categories raw data:", response);
      }
      return response;
    }));
  }

  // Получает список тем, указанных категорий
  //
  private topics$(categoriesData: ForumCategoriesDataResponse): Observable<ForumTopicsDataResponse> {
    const categories: string[] = categoriesData.map(val => val.object.id);
    if (!categories.length) {
      return of([]);
    }
    const requestData: ForumTopicsDataRequest = {
      categories: categories
    };
    return this.api.Get<ForumTopicsDataResponse>(
      `forum/topics`,
      requestData,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      ForumTopicsDataResponse
    ).pipe(map((response) => {
      if (environment.displayLog) {
        console.log("Forum topics raw data:", response);
      }
      return response;
    }));
  }

  // Формирует данные форума из списка категорий и тем
  //
  private forumsDataFromServerData(categoriesData: ForumCategoriesDataResponse, topicsData: ForumTopicsDataResponse): ForumsData {

    const forumsData: ForumsData = [];
    for (const category of categoriesData) {
      const forumData: ForumData = {
        ...category,
        isOpen: true,
        openClose: function () {
          this.isOpen = !this.isOpen;
        },
        moderationIsAvailable: function (auth: AuthService) {
          if (!this.object.moderators || !this.object.moderators.length) {
            return false;
          }
          return (this.object.moderators.findIndex(val => val.id === auth.getUserDescription().id) > -1);
        },
        topics: topicsData.filter(val => val.object.context === category.object.id)
      };
      forumsData.push(forumData);
    }

    return forumsData.filter(val => val.topics.length || val.moderationIsAvailable(this.auth));

  }

  // Получает список сообщений из базы
  //
  private messages$(topic: string): Observable<MessagesFromBaseResponse> {
    return this.api.Get<MessagesFromBaseResponse>(
      `forum/${topic}/messages/text`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      MessagesFromBaseResponse,
      APIDataTypes.xml
    ).pipe(map((response) => {
      if (environment.displayLog) {
        console.log("Messages raw data:", response);
      }
      return response;
    }));
  }

}
