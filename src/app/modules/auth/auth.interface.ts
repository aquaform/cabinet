import { AdditionalInformationElementArray } from '@modules/user/user.interface';
import { AuthPermissionNameExtended, authPermissionNamesExtended, AuthPermissionsDataExtended } from '@pages/extended-pages.interface';
import { ObjectAPI } from '../root/api/api.converter';

// Состояния авторизации
//
export enum authStatuses { UNKNOWN, AUTHENTICATED, NOT_AUTHENTICATED }

export type AuthMessageCode =
    "emptyUserName"
    | "tooManyUsers"
    | "noPinCode"
    | "usedPinCode"
    | "disabledPinCode"
    | "noUser"
    | "errorAuthorization"
    | "errorRegisterUser"
    | "errorDoubleAuthorization"
    | "errorDateAuthorization"
    | "errorDateAuthorizationNewPinCode"
    | "errorDateAuthorizationNoPeriodInPinCode"
    | "noUserMail"
    | "userAlreadyExist"
    | "emptyMail"
    | "notIdenticalUserMail"
    | "notUniqueMail"
    | "";

export const authMessageCodes = {
    emptyUserName: "emptyUserName" as AuthMessageCode,
    tooManyUsers: "tooManyUsers" as AuthMessageCode,
    noPinCode: "noPinCode" as AuthMessageCode,
    usedPinCode: "usedPinCode" as AuthMessageCode,
    disabledPinCode: "disabledPinCode" as AuthMessageCode,
    noUser: "noUser" as AuthMessageCode,
    errorAuthorization: "errorAuthorization" as AuthMessageCode,
    errorRegisterUser: "errorRegisterUser" as AuthMessageCode,
    errorDoubleAuthorization: "errorDoubleAuthorization" as AuthMessageCode,
    errorDateAuthorization: "errorDateAuthorization" as AuthMessageCode,
    errorDateAuthorizationNewPinCode: "errorDateAuthorizationNewPinCode" as AuthMessageCode,
    errorDateAuthorizationNoPeriodInPinCode: "errorDateAuthorizationNoPeriodInPinCode" as AuthMessageCode,
    noUserMail: "noUserMail" as AuthMessageCode,
    userAlreadyExist: "userAlreadyExist" as AuthMessageCode,
    emptyMail: "emptyMail" as AuthMessageCode,
    notIdenticalUserMail: "notIdenticalUserMail" as AuthMessageCode,
    notUniqueMail: "notUniqueMail" as AuthMessageCode,
};

export type AuthPermissionName =
    "education"
    | "library"
    | "messages"
    | "forum"
    | "news"
    | "addNews"
    | "electronicResources"
    | "myEduGroups"
    | "usersCatalog"
    | "users"
    | "teaching"
    | AuthPermissionNameExtended;

export const authPermissionNames = {
    education: "education" as AuthPermissionName,
    library: "library" as AuthPermissionName,
    messages: "messages" as AuthPermissionName,
    forum: "forum" as AuthPermissionName,
    news: "news" as AuthPermissionName,
    addNews: "addNews" as AuthPermissionName,
    electronicResources: "electronicResources" as AuthPermissionName,
    myEduGroups: "myEduGroups" as AuthPermissionName,
    usersCatalog: "usersCatalog" as AuthPermissionName,
    users: "users" as AuthPermissionName,
    teaching: "teaching" as AuthPermissionName,
    ...authPermissionNamesExtended,
};

export type StartBlockName = "primary" | "studentActivities" | "teacherActivities" | "teacherTasks" | "news" | "pinCodes";

export const startBlockNames = {
    primary: "primary" as StartBlockName,
    studentActivities: "studentActivities" as StartBlockName,
    teacherActivities: "teacherActivities" as StartBlockName,
    teacherTasks: "teacherTasks" as StartBlockName,
    news: "news" as StartBlockName,
    pinCodes: "pinCodes" as StartBlockName,
};

export class AuthPermissionsData extends AuthPermissionsDataExtended {
    education: boolean;
    library: boolean;
    messages: boolean;
    forum: boolean;
    news: boolean;
    addNews: boolean;
    electronicResources: boolean;
    myEduGroups: boolean;
    usersCatalog: boolean;
    users: boolean;
    teaching: boolean;
}

export class AuthMessage {
    isError: boolean;
    messageCode: AuthMessageCode;
    messageText: string;
    data: {};
}

export class PinCode {
    code: string;
    option: string;
}

export class SignInRequest {
    login: string;
    clientID: string;
    key: string;
    version: string;
    usePinCode: boolean;
    pinCode: string;
    pinCodeOption: string;
    userUUID: string;
}

export class SignInResponse {
    session: string;
    user: string;
    date: number;
    permissions: AuthPermissionsData;
    login: string;
    typeSession: "standard" | "cas";
    notification: string;
    clientID: string;
    eduOrganization: boolean; // TODO To delete
    event: string;
    @ObjectAPI(AdditionalInformationElementArray) additionalInformation: AdditionalInformationElementArray;
    passwordHash?: string; // Добавлено в 3.0.15.7
}



export type authIconVariant = "EMPTY_AVATAR";

export const authIconVariants = {
    EMPTY_AVATAR: "EMPTY_AVATAR" as authIconVariant
};



export class SignInDataCASData {
    clientID: string;
    version: string;
    publication: string;
}

export class OpenIdAnyResponse {
    event: string;
}


export class CheckOpenIDSessionResponse extends OpenIdAnyResponse {
    result: boolean;
}

export class OpenIDSessionDataResponse extends SignInResponse {

}
