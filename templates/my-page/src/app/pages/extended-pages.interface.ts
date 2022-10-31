import { Routes } from "@angular/router";
import { ITranslationResource } from "ngx-translate-multi-http-loader";
import { Page } from "@pages/pages.interface";
import { APIServiceName } from "@modules/root/api/api.interface";
import { ServiceSettings } from "@modules/root/settings/settings.interface";

// Права

export type AuthPermissionNameExtended = "";

export class AuthPermissionsDataExtended {}

export const authPermissionNamesExtended = {}

// Навигация
//

export type NavElementNameExtended = "my_page";

export const navElementNamesExtended = {
    my_page: "my_page" as NavElementNameExtended,
};

// Страницы
//

export type PageNameExtended = "my_page";

export const pageNamesExtended = {
    my_page: "my_page" as PageNameExtended,
};

export const pagesExtended: Page[] = [
    {
        name: pageNamesExtended.my_page,
        permission: null,
        permissions: [],
        public: false,
        i18n: 'MY_PAGE.NAV.ELEMENTS.myPage',
        icon: {
            file: "hardware",
            name: "new"
        }
    },
];

export const routesExtended: Routes = [
    { path: "my_page", loadChildren: () => import('./my-page/my-page.module').then(m => m.MyPageModule) },
 ]

// Локализация
//

export const translationResourcesExtended: ITranslationResource[] = [
    { prefix: "./assets/i18n/modules/my-page/", suffix: ".json" },
];

// Термины
//

export const APITermsExtended: {} = {};

// HTTP-сервисы

export type APIServiceNameExtended = "";

export const APIServiceNamesExtended = {};

export class ServiceExtended {
    public static URL(serviceName: APIServiceName): ServiceSettings {
        throw `Service ${serviceName} is not supported`;
    }
}