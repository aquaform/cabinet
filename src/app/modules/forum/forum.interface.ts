import { ArrayElementAPI, ObjectAPI, DateAPI, ConvertValueAPI } from '@modules/root/api/api.converter';
import { UserDescription } from '@modules/user/user.interface';
import { eduUserToUserDescription } from '@modules/activities/activities.interface';
import { FileToUpload } from '@modules/root/upload/upload.interface';
import { AuthService } from '@modules/auth/auth.service';

/* Категории */

export class ForumDescriptionLastMessage {
    @ObjectAPI(UserDescription) author: UserDescription;
    @DateAPI() date: Date;
    haveAttachments: boolean;
    id: string;
    isGroupTopic: boolean;
    parentMessage: string;
    topic: string;
    topicName: string;
}

export class ForumUserDescription {
    @DateAPI() dateView: Date;
}

@ArrayElementAPI(UserDescription)
export class ForumCategoriesModeratorsResponse extends Array<UserDescription> {

}

export class ForumCategoryObject {
    id: string;
    name: string;
    number: number;
    parent: string;
    type: "forum";
    @ObjectAPI(ForumCategoriesModeratorsResponse) moderators: ForumCategoriesModeratorsResponse;
}

export class ForumCategoryDescription {
    countMessages: number;
    countTopics: number;
    @ObjectAPI(ForumDescriptionLastMessage) lastMessage: ForumDescriptionLastMessage;
}

export class ForumCategoryData {
    @ObjectAPI(ForumCategoryObject) object: ForumCategoryObject;
    @ObjectAPI(ForumCategoryDescription) description: ForumCategoryDescription;
    @ObjectAPI(ForumUserDescription) userDescription: ForumUserDescription;
}

@ArrayElementAPI(ForumCategoryData)
export class ForumCategoriesDataResponse extends Array<ForumCategoryData> {

}

/* Темы */

export class ForumTopicObject {
    @ObjectAPI(UserDescription) author: UserDescription;
    context: string;
    contextName: string;
    @DateAPI() creationDate: Date;
    id: string;
    name: string;
}

export class ForumTopicDescription {
    countMessages: number;
    @ObjectAPI(ForumDescriptionLastMessage) lastMessage: ForumDescriptionLastMessage;
}

export class ForumTopicData {
    @ObjectAPI(ForumTopicObject) object: ForumTopicObject;
    @ObjectAPI(ForumTopicDescription) description: ForumTopicDescription;
    @ObjectAPI(ForumUserDescription) userDescription: ForumUserDescription;
    // ДОБАВЛЕНО:
    get dateView(): Date {
        if (this.userDescription) {
            return this.userDescription.dateView;
        }
        return null;
    }
    get isNew(): boolean {
        return (
            this.userDescription
            && this.userDescription.dateView.getTime()
            && this.description
            && this.description.lastMessage
            && this.description.lastMessage.date.getTime() <= this.userDescription.dateView.getTime()) ? false : true;
    }
}

@ArrayElementAPI(ForumTopicData)
export class ForumTopicsDataResponse extends Array<ForumTopicData> {

}

export class ForumTopicsDataRequest {
    categories: string[];
}

/* Список категорий и тем */

export class ForumData extends ForumCategoryData {
    topics: ForumTopicsDataResponse;
    isOpen: boolean;
    openClose: () => void;
    moderationIsAvailable: (auth: AuthService) => boolean;
}

export class ForumsData extends Array<ForumData> {

}

/* Сообщения */

export class MessageFromBaseDataAttributes {
    id: string;
    numParentMessage: string;
    number: string;
}

export class MessageFile {
    name: string;
    id: string;
    extension: string;
}

@ArrayElementAPI(MessageFile)
export class MessageFileArray extends Array<MessageFile>  {

}

export class MessageFileObject {
    @ObjectAPI(MessageFileArray) file: MessageFileArray;
}

export class MessageFromBaseData {
    @ConvertValueAPI(eduUserToUserDescription) author: UserDescription;
    date: string;
    isAttachedFiles: boolean;
    text: string;
    @DateAPI() timeStamp: Date;
    @ObjectAPI(MessageFileObject) files: MessageFileObject;
    @ObjectAPI(MessageFromBaseDataAttributes) _attributes: MessageFromBaseDataAttributes;
}

@ArrayElementAPI(MessageFromBaseData)
export class MessageFromBaseDataArray extends Array<MessageFromBaseData> {

}

export class MessageDataFromBase {
    @ObjectAPI(MessageFromBaseDataArray) message: MessageFromBaseDataArray;
}

export class MessagesFromBaseResponse {
    @ObjectAPI(MessageDataFromBase) response: MessageDataFromBase;
}

export class MessageData {
    id: string;
    author: UserDescription;
    isAttachedFiles: boolean;
    files: MessageFile[];
    date: Date;
    text: string;
    children: MessageData[];
    topic: string;
}

export interface TopicData {
    topic: ForumTopicData;
    messages: MessageData[];
    category: ForumData;
}

/* Новое сообщение */

export interface NewForumMessageSendData {
    topic: string;
    textNewMessage: string;
    replyTo: string;
    files: FileToUpload[];
    textNewTopic: string;
    addressee: string;
    context: string;
    contextType: string;
}

export interface NewForumMessageFormData {
    text: string;
    files: File[];
    isSaving: boolean;
    topicName: string;
    validate(): boolean;
}

export class UploadedMessageFile {
    name: string;
    ref: string;
    extension: string;
}

@ArrayElementAPI(UploadedMessageFile)
export class UploadedMessageFilesArray extends Array<UploadedMessageFile> {

}

export class NewForumMessageResponse {
    message: string;
    @ObjectAPI(UploadedMessageFilesArray) uploadedFiles: UploadedMessageFilesArray;
}

export class ForumMessageSaveSettingsRequest {
    dateView: Date;
    name?: "Deleted";
    value?: boolean;
}

export class ForumMessageSaveSettingsResponse {
    operationComplete: boolean;
}

export class ForumDeleteMessageResponse {
    operationComplete: boolean;
}