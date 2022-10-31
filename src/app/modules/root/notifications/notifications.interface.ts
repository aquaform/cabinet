import { ObjectAPI } from '@modules/root/api/api.converter';
import { UserDescription } from '@modules/user/user.interface';

export class NotificationRequest {
    getCountUsersOnline: boolean;
}

export class NotificationResponse {
    countNewPersonalMessages: number;
    countNewForumMessages: number;
    countNewNews: number;
    countUsersOnline: number;
    @ObjectAPI(UserDescription) user: UserDescription;
}

export type NotificationElementName = "countNewPersonalMessages" | "countNewForumMessages" | "countNewNews"
    | "countUsersOnline" | "primaryEducationActivity";

export const notificationElementNames =  {
    countNewPersonalMessages: "countNewPersonalMessages" as NotificationElementName,
    countNewForumMessages: "countNewForumMessages" as NotificationElementName,
    countNewNews: "countNewNews" as NotificationElementName,
    countUsersOnline: "countUsersOnline" as NotificationElementName,
    primaryEducationActivity: "primaryEducationActivity" as NotificationElementName
};

export class NotificationData extends NotificationResponse {

}
