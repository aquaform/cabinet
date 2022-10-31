import { DateAPI, ObjectAPI, ArrayElementAPI, ConvertValueAPI } from '@modules/root/api/api.converter';
import { UserDescription, CurrentUserDescription } from '@modules/user/user.interface';
import { eduUserToUserDescription } from '@modules/activities/activities.interface';
import { FileToUpload } from '@modules/root/upload/upload.interface';

/* Данные списка сообщений в компонентах */

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

export class MessageListDescription {
    id: string;
    @DateAPI() date: Date;
    @DateAPI() dateView: Date | null;
    haveAttachments: boolean;
    @ObjectAPI(UserDescription) author: UserDescription;
    @ObjectAPI(UserDescription) addressee: UserDescription;
    text?: string;
    @ObjectAPI(MessageFileObject) files: MessageFileObject;
    companion(currentUser: CurrentUserDescription): UserDescription {
        if (this.author.id !== currentUser.id) {
            return this.author;
        }
        return this.addressee;
    }
    isNew(currentUser: CurrentUserDescription): boolean {
        return (this.author.id !== currentUser.id && !this.dateView) ? true : false;
    }
    get filesArray(): MessageFile[] {
        if (!this.files || !this.files.file) {
            return [];
        }
        return this.files.file;
    }
}

export class TopicListDescription {
    id: string;
    name: string;
    messages: MessageListDescription[];
    get lastMessage(): MessageListDescription {
        let lastMessage: MessageListDescription = null;
        for (const currentMessage of this.messages) {
            if (!lastMessage) {
                lastMessage = currentMessage;
                continue;
            }
            if (lastMessage.date.getTime() < currentMessage.date.getTime()) {
                lastMessage = currentMessage;
            }
        }
        return lastMessage;
    }
    lastCompanionMessage(currentUser: CurrentUserDescription): MessageListDescription {
        let lastMessage: MessageListDescription = null;
        for (const currentMessage of this.messages) {
            if (!lastMessage) {
                lastMessage = currentMessage;
                continue;
            }
            if (lastMessage.date.getTime() < currentMessage.date.getTime()
                && lastMessage.author.id !== currentUser.id) {
                lastMessage = currentMessage;
            }
        }
        return lastMessage;
    }
    allCompanionMessages(currentUser: CurrentUserDescription): MessageListDescription[] {
        return this.messages.filter(val => val.author.id !== currentUser.id);
    }
    companion(currentUser: CurrentUserDescription): UserDescription {
        return this.lastMessage.companion(currentUser);
    }
    get date(): Date {
        return this.lastMessage.date;
    }
    isNewCompanionMessages(currentUser: CurrentUserDescription): boolean {
        return (this.allCompanionMessages(currentUser).findIndex(val => !val.dateView) > -1) ? true : false;
    }
}

/* Данные сообщений из БД */

export class MessageDataObject {
    topic: string;
    topicName: string;
    @DateAPI() date: Date;
    @ObjectAPI(UserDescription) author: UserDescription;
    id: string;
    isGroupTopic: boolean;
    parentMessage: string;
    haveAttachments: boolean;
    @ObjectAPI(UserDescription) addressee: UserDescription;
}

export class MessageDataTopicLastMessage {
    topic: string;
    topicName: string;
    @DateAPI() date: Date;
    @ObjectAPI(UserDescription) author: UserDescription;
    id: string;
    isGroupTopic: boolean;
    parentMessage: string;
    haveAttachments: boolean;
    @ObjectAPI(UserDescription) addressee: UserDescription;
}

export class MessageDataTopic {
    countMessages: number;
    @ObjectAPI(MessageDataTopicLastMessage) lastMessage: MessageDataTopicLastMessage;
}

export class MessageDataPersonalSettings {
    @DateAPI() dateView: Date;
}

export class MessagesData {
    @ObjectAPI(MessageDataObject) object: MessageDataObject;
    @ObjectAPI(MessageDataPersonalSettings) userDescription: MessageDataPersonalSettings | null;
    @DateAPI() date: Date;
    @ObjectAPI(MessageDataTopic) topic: MessageDataTopic;
}

@ArrayElementAPI(MessagesData)
export class MessagesDataResponse extends Array<MessagesData> {

}

export class UploadedMessageFile {
    name: string;
    ref: string;
    extension: string;
}

@ArrayElementAPI(UploadedMessageFile)
export class UploadedMessageFilesArray extends Array<UploadedMessageFile> {

}

export class NewMessageResponse {
    message: string;
    @ObjectAPI(UploadedMessageFilesArray) uploadedFiles: UploadedMessageFilesArray;
}

export class NewMassMessageResponse {
    massMessage: string;
}

/* Каталог пользователей в компонентах */

export class MessageUser extends UserDescription {
    description: string;
}

export class MessageUserCatalogGroup {
    name: string;
    users: MessageUser[];
}

export class MessageUserCatalog {
    groups: MessageUserCatalogGroup[];
    get allUsers(): MessageUser[] {
        const allUsers: MessageUser[] = [];
        for (const currentGroup of this.groups) {
            for (const currentUser of currentGroup.users) {
                if (!allUsers.find(val => val.id === currentUser.id)) {
                    allUsers.push(currentUser);
                }
            }
        }
        return allUsers;
    }
}

/* Каталог пользователей в БД */

@ArrayElementAPI(UserDescription)
export class MessageUsers extends Array<UserDescription>  {

}

export class MessageUserCatalogEduGroup {
    name: string;
    @ObjectAPI(MessageUsers) participants: MessageUsers;
    type: string;
    id: string;
}

@ArrayElementAPI(MessageUserCatalogEduGroup)
export class MessageUserCatalogEduGroups extends Array<MessageUserCatalogEduGroup> {

}

export class MessageOrganizerUserDescription {
    name: string;
    id: string;
    user: string;
    description: string;
}

export class MessageOrganizerDescription {
    @ObjectAPI(MessageOrganizerUserDescription) object: MessageOrganizerUserDescription;
}

@ArrayElementAPI(MessageOrganizerDescription)
export class MessageOrganizers extends Array<MessageOrganizerDescription> {

}

export class MessageUserCatalogResponse {
    @ObjectAPI(MessageUserCatalogEduGroups) eduGroups: MessageUserCatalogEduGroups;
    @ObjectAPI(MessageUsers) teachers: MessageUsers;
    @ObjectAPI(MessageOrganizers) organizers: MessageOrganizers;
    @ObjectAPI(MessageUsers) participants: MessageUsers; // Добавлено в 3.0.19.29
}

/* Текст сообщения в БД */



export class MessageTextResponseObjectMessage {
    @ConvertValueAPI(eduUserToUserDescription) author: UserDescription;
    date: string;
    @DateAPI() timeStamp: Date;
    text: string;
    isAttachedFiles: boolean;
    @ObjectAPI(MessageFileObject) files: MessageFileObject;
}

export class MessageTextResponseObject {
    @ObjectAPI(MessageTextResponseObjectMessage) message: MessageTextResponseObjectMessage;
}

export class MessageTextResponse {
    @ObjectAPI(MessageTextResponseObject) response: MessageTextResponseObject;
}

/* Удаление сообщений */

export class MessageSaveSettingsRequest {
    dateView: Date;
    name?: "Deleted";
    value?: boolean;
}

export class MessageDeleteMessageResponse {
    operationComplete: boolean;
}

export class NewMessageInputData {
    id: string;
    name: string;
    toUser: boolean;
    toProvidingEducation: boolean;
}

export interface NewMessageFormData {
    text: string;
    files: File[];
    isSaving: boolean;
    topicName?: string;
    validate(): boolean;
}

export interface NewMessageSendData {
    context: string;
    contextType: string;
    topic: string;
    addressee: string;
    textNewMessage: string;
    textNewTopic: string;
    replyTo: string;
    files: FileToUpload[];
}

export interface NewMassMessageSendData {
    providingEducation: string;
    textNewMessage: string;
    textNewTopic: string;
}

/* Страницы */

export type MessagePageType = "incoming" | "outgoing" | "trash" | "contacts";

export const messagePageTypes = {
    incoming: "incoming" as MessagePageType,
    outgoing: "outgoing" as MessagePageType,
    trash: "trash" as MessagePageType,
    contacts: "contacts" as MessagePageType,
};
