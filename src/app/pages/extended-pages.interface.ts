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

export type NavElementNameExtended = "";

export const navElementNamesExtended = {};

// Страницы
//

export type PageNameExtended = "";

export const pageNamesExtended = {};

export const pagesExtended: Page[] = [];

export const routesExtended: Routes = []

// Локализация
//

export const translationResourcesExtended: ITranslationResource[] = [];

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