import { FormField } from '../forms/forms.interface';
import { Lang } from '@modules/root/i18n/i18n.class';

export type LogoSize = "" | "300x100" | "200x100" | "100x100" | "100x150";

export const logoSizes = {
    "300x100": "300x100" as LogoSize,
    "200x100": "200x100" as LogoSize,
    "100x100": "100x100" as LogoSize,
    "100x150": "100x150" as LogoSize,
};

export class SettingsPortalInterface {
    name: string;
    host: string;
    title: string;
    basePortal: string;
    baseDesktop: string;
    baseAdmin: string;
    baseRes: string;
    baseImages: string;
    baseFiles: string;
    startPage: string;
    cookiesExpires: number;
    logo: string;
    logoSize?: LogoSize; // Добавлено в в 3.0.17
    footer: string;
    language: string;
    sentry: string;
    displayLog: boolean;
    idle: number;
    availablePinCodesOnStartPage: boolean;
    storageName: (name: string) => string;
}

class FilterUserTitle {
    [lang: string]: string;
}

export type StudentActivityFilter = "default" | "kindEducation" | "module" | "subject" | "week" | "month" | "year" | "status";

export const studentActivityFilters = {
    default: "default" as StudentActivityFilter,
    kindEducation: "kindEducation" as StudentActivityFilter,
    module: "module" as StudentActivityFilter,
    subject: "subject" as StudentActivityFilter,
    week: "week" as StudentActivityFilter,
    month: "month" as StudentActivityFilter,
    year: "year" as StudentActivityFilter,
    status: "status" as StudentActivityFilter,
};

export class StudentActivityFilterInterface {
    name: StudentActivityFilter;
    titles: FilterUserTitle;
}

export class ActivitiesFiltersInterface {
    studentActivitiesFilters: StudentActivityFilterInterface[];
}

export class ActivitiesSettingsInterface {
    availableDescriptionPage: boolean;
    availableActivePage: boolean;
    availableCalendarPage: boolean;
    openResInNewWindow: boolean;
    availableResultsPage: boolean;
    availableCertificatesPage: boolean;
    availableOpenEduPage: boolean;
    availableStatusActivities: boolean;
    displayTeachersRole: boolean;
    availableToCheckPage: boolean;
    timeToCancelTaskAnswer: number;
    filters: ActivitiesFiltersInterface; // Добавлено в 3.0.14
    hideEmptyLibraryElements: boolean; // Добавлено в 3.0.14
    maxFileSize: number; // Добавлено в 3.0.19
}

export class NewsSettingsInterface {
    fromLastDays: number;
}

export class CommunicationSettingsInterface {
    availableMessagesFromUserProfile: boolean;
}

export class LibrarySettingsInterface {
    openItemsInNewWindow: boolean;
    displayCountItems: boolean;
}


export type ProfileCommandVariant = "" | "login" | "loginAndPhoto" | "name" | "nameAndPhoto" | "photo";

export const profileCommandVariants = {
    login: "login" as ProfileCommandVariant,
    loginAndPhoto: "loginAndPhoto" as ProfileCommandVariant,
    name: "name" as ProfileCommandVariant,
    nameAndPhoto: "nameAndPhoto" as ProfileCommandVariant,
    photo: "photo" as ProfileCommandVariant,
};

export class UsersSettingsInterface {
    displayOnline: boolean;
    displayOnlineInMenu: boolean;
    disableProfilePhoto: boolean;
    disableProfileContacts: boolean;
    disableProfileAdditional: boolean;
    disableProfileNotice: boolean;
    profileCommandVariant: ProfileCommandVariant;
}

export class ElectronicResourcesSettingsInterface {
    displaySearch: boolean;
}

export type BackendReportsAllocation = "teacherActivityPage" | "teacherPage";

export const backendReportsAllocations = {
    teacherActivityPage: "teacherActivityPage" as BackendReportsAllocation,
    teacherPage: "teacherPage" as BackendReportsAllocation,
};

export type BackendReportsFormatType = "HTML5" | "XLSX" | "PDF";

export const backendReportsFormatTypes = {
    HTML5: "HTML5" as BackendReportsFormatType,
    XLSX: "XLSX" as BackendReportsFormatType,
    PDF: "PDF" as BackendReportsFormatType,
};

export class ReportSettingsAllocation {
    allocation: BackendReportsAllocation;
    id: string;
    title: string;
}

export class ReportSettingsFormat {
    type: BackendReportsFormatType;
}

export class ReportsSettingsInterface {
    allocations: ReportSettingsAllocation[];
    formats: ReportSettingsFormat[];
}

export class ServiceSettings {
    url: string;
    user: string;
    password: string;
}


export class SettingsEduInterface extends ServiceSettings {
    features: {
        activities: ActivitiesSettingsInterface;
        news: NewsSettingsInterface;
        communication: CommunicationSettingsInterface;
        library: LibrarySettingsInterface;
        users: UsersSettingsInterface;
        electronicResources: ElectronicResourcesSettingsInterface;
        backendReports: ReportsSettingsInterface;
    };

}

export class RegistrationFormField extends FormField {
    // ...FormField
    useAsLogin: boolean;
}

export class UserAgreementTitle {
    [lang: string]: string;
}

export class UserAgreementDocument {
    title: string;
    url: string;
    lang: Lang;
}

export class UserAgreementSettings {
    available: boolean;
    title: UserAgreementTitle;
    documents: UserAgreementDocument[];
}

export class RegistrationSettings {
    available: boolean;
    usePinCode: boolean;
    placeToUp: boolean;
    url: string;
    form: RegistrationFormField[];
    userAgreement?: UserAgreementSettings; // Добавлено в 3.0.17
}

export class RestoreSettings {
    available: boolean;
    url: string;
}

export class AuthenticationFieldSettings {
    title: string;
    description: string;
    placeholder: string;
}

export class AuthenticationSettings {
    standard: {
        available: boolean;
        login?: AuthenticationFieldSettings;
    };
    cas: {
        available: boolean;
        url: string;
        service: string;
        name: string;
        icon: string;
    };
    openid: {
        available: boolean;
        provider: string;
        cancelAuthProvider: boolean;
        checkOnLoad: boolean;
        name: string;
    };
    os: { // Добавлено в 3.0.15.7
        available: boolean;
        publicationURL: string;
        name: string;
    }
}

export class SettingsUserStatisticsInterface {
    available: boolean;
    periodicity: number;
}

export class SettingsUsersInterface extends ServiceSettings {
    features: {
        registration: RegistrationSettings;
        restore: RestoreSettings;
        authentication: AuthenticationSettings;
    };
    statistics?: SettingsUserStatisticsInterface;
}

export class SettingsResInterface extends ServiceSettings {
    wsURL: string;
    wsUsername: string;
    wsPassword: string;
}

export class CloseSessionRequest {
    tabUUID: string;
}