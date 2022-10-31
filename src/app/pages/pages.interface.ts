import { AuthPermissionName, authPermissionNames } from '@modules/auth/auth.interface';
import { PageNameExtended, pageNamesExtended, pagesExtended } from './extended-pages.interface';

export type PageName =
    | "auth"
    | "calendar"
    | "certificate"
    | "forum"
    | "library"
    | "messages"
    | "profile"
    | "start"
    | "education"
    | "teaching"
    | "course"
    | PageNameExtended;

export const pageNames = {
    auth: "auth" as PageName,
    calendar: "calendar" as PageName,
    certificate: "certificate" as PageName,
    forum: "forum" as PageName,
    library: "library" as PageName,
    messages: "messages" as PageName,
    profile: "profile" as PageName,
    start: "start" as PageName,
    education: "education" as PageName,
    teaching: "teaching" as PageName,
    course: "course" as PageName,
    ...pageNamesExtended,
};

export class PageIcon {
    file: string;
    name: string;
}

export class Page {
    name: PageName;
    permission: AuthPermissionName; // Разрешено, если доступно право
    permissions: AuthPermissionName[]; // Разрешено, если доступно хотя бы одно право
    public: boolean;
    i18n: string;
    icon: PageIcon;
}

export const pages: Page[] = [
    {
        name: pageNames.auth,
        permission: null,
        permissions: [],
        public: true,
        i18n: 'NAV.ELEMENTS.auth',
        icon: {
            file: "hardware",
            name: "auth"
        }
    },
    {
        name: pageNames.calendar,
        permission: null,
        permissions: [authPermissionNames.education, authPermissionNames.teaching],
        public: false,
        i18n: 'NAV.ELEMENTS.calendar',
        icon: {
            file: "hardware",
            name: "calendar"
        }
    },
    {
        name: pageNames.certificate,
        permission: null,
        permissions: [],
        public: true,
        i18n: 'NAV.ELEMENTS.certificate',
        icon: {
            file: "hardware",
            name: "certificate"
        }
    },
    {
        name: pageNames.forum,
        permission: authPermissionNames.forum,
        permissions: [],
        public: false,
        i18n: 'NAV.ELEMENTS.forum',
        icon: {
            file: "hardware",
            name: "forum"
        }
    },
    {
        name: pageNames.library,
        permission: authPermissionNames.library,
        permissions: [],
        public: false,
        i18n: 'NAV.ELEMENTS.library',
        icon: {
            file: "hardware",
            name: "library"
        }
    },
    {
        name: pageNames.messages,
        permission: authPermissionNames.messages,
        permissions: [],
        public: false,
        i18n: 'NAV.ELEMENTS.messages',
        icon: {
            file: "hardware",
            name: "messages"
        }
    },
    {
        name: pageNames.profile,
        permission: null,
        permissions: [],
        public: false,
        i18n: 'NAV.ELEMENTS.profile',
        icon: {
            file: "hardware",
            name: "profile"
        }
    },
    {
        name: pageNames.start,
        permission: null,
        permissions: [],
        public: false,
        i18n: 'NAV.ELEMENTS.start',
        icon: {
            file: "hardware",
            name: "start"
        }
    },
    {
        name: pageNames.education,
        permission: authPermissionNames.education,
        permissions: [],
        public: false,
        i18n: 'NAV.ELEMENTS.education',
        icon: {
            file: "hardware",
            name: "education"
        }
    },
    {
        name: pageNames.teaching,
        permission: authPermissionNames.teaching,
        permissions: [],
        public: false,
        i18n: 'NAV.ELEMENTS.teaching',
        icon: {
            file: "hardware",
            name: "teaching"
        }
    },
    {
        name: pageNames.course,
        permission: null,
        permissions: [],
        public: false,
        i18n: 'NAV.ELEMENTS.course',
        icon: {
            file: "hardware",
            name: "course"
        }
    },
    ...pagesExtended
];
