import { PageName, Page } from '@pages/pages.interface';
import { authIconVariant } from '@modules/auth/auth.interface';
import { EduActivity } from '@modules/activities/activities.interface';
import { NavElementNameExtended, navElementNamesExtended } from '@pages/extended-pages.interface';

export type NavElementName =
    "start"
    | "education"
    | "teaching"
    | "calendar"
    | "library"
    | "messages"
    | "forum"
    | "profile"
    | NavElementNameExtended;

export const navElementNames = {
    start: "start" as NavElementName,
    education: "education" as NavElementName,
    teaching: "teaching" as NavElementName,
    calendar: "calendar" as NavElementName,
    library: "library" as NavElementName,
    messages: "messages" as NavElementName,
    forum: "forum" as NavElementName,
    profile: "profile" as NavElementName,
    ...navElementNamesExtended
};

export class NavElement {
    name: NavElementName;
    pageName: PageName;
}

export class NavBarElement {
    name: NavElementName;
    i18n: string;
    page: Page;
}

export interface ProfileElement {
    page: NavElementName;
    emptyAvatarIconName: authIconVariant;
    avatarImagePath: string;
}

export interface StartPageDataToPrimaryBlock {
    primaryEducationActivity: EduActivity;
}


