import { Injectable } from '@angular/core';
import {
  SettingsPortalInterface,
  SettingsEduInterface,
  SettingsUsersInterface,
  SettingsResInterface,
  RegistrationSettings,
  RestoreSettings,
  AuthenticationSettings,
  ActivitiesSettingsInterface,
  UsersSettingsInterface,
  NewsSettingsInterface,
  CommunicationSettingsInterface,
  LibrarySettingsInterface,
  ElectronicResourcesSettingsInterface,
  SettingsUserStatisticsInterface,
  AuthenticationFieldSettings,
  ReportSettingsAllocation,
  BackendReportsAllocation,
  BackendReportsFormatType,
  backendReportsFormatTypes,
  ServiceSettings,
} from './settings.interface';
import { APIServiceName, APIServiceNames } from '@modules/root/api/api.interface';
import { Lang } from '../i18n/i18n.class';
import { LocationTools } from '../location/location.class';
import { version } from "../../../../../package.json";
import { release } from "../../../../../package.json";
import { APIServiceNamesExtended, ServiceExtended } from '@pages/extended-pages.interface';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from '../errors/errors.service';
import { LogoSize, logoSizes } from './settings.interface';

declare var oSettingsPortal: SettingsPortalInterface;
declare var oSettingsEdu: SettingsEduInterface;
declare var oSettingsUsers: SettingsUsersInterface;
declare var oSettingsRes: SettingsResInterface;

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private userLanguageSettingsName = "userLanguage";

  constructor() {
  }

  Check(translate: TranslateService, errorService: ErrorsService): void {

    const origins = {
      currentOrigin: window.location.origin,
      settingsOrigin: ""
    };

    try {
      origins.settingsOrigin = (new URL(oSettingsPortal.host)).origin;
    } catch (err) {
      errorService.register(err);
    }

    if (origins.currentOrigin !== origins.settingsOrigin) {

      translate.get("ERRORS.currentOriginDiffersFromSettings", origins).subscribe(
        (warnText) => console.warn(warnText),
        (err) => errorService.register(err)
      );

    }
  }

  Version(): string {
    return version + "." + release;
  }

  StorageName(dataName: string): string {
    return oSettingsPortal.storageName(dataName);
  }

  Title(): string {
    return oSettingsPortal.title;
  }

  PublicationName(): string {
    return oSettingsPortal.name;
  }

  IdleTime(): number {
    return oSettingsPortal.idle;
  }

  CookiesExpires(): number {
    return (oSettingsPortal.cookiesExpires) ? oSettingsPortal.cookiesExpires : 30;
  }

  ServiceURL(serviceName: APIServiceName): string {

    const host: string = oSettingsPortal.host;

    const service: ServiceSettings = (() => {
      if (serviceName in APIServiceNamesExtended) {
        return ServiceExtended.URL(serviceName);
      }
      switch (serviceName) {
        case APIServiceNames.edu:
          return oSettingsEdu;
        case APIServiceNames.res:
          return oSettingsRes;
        case APIServiceNames.users:
          return oSettingsUsers;
        default:
          return oSettingsEdu;
      }
    })();

    const url = new URL(host + service.url);
    url.password = service.password;
    url.username = service.user;

    return url.href;

  }

  CabinetURL(): string {
    return oSettingsPortal.host + oSettingsPortal.baseDesktop;
  }

  Statistics(): SettingsUserStatisticsInterface {
    if (oSettingsUsers.statistics) {
      return oSettingsUsers.statistics;
    }
    const defaultSettings: SettingsUserStatisticsInterface = {
      available: true,
      periodicity: 300
    };
    return defaultSettings;
  }

  ImageURL(imagePath: string, rndParam?: string): string {
    if (LocationTools.isURL(imagePath)) {
      return imagePath;
    }
    const rnd = (rndParam) ? `?rnd=${rndParam}` : '';
    const folder = (oSettingsPortal.baseImages) ? oSettingsPortal.host + oSettingsPortal.baseImages : this.DesktopBase();
    return folder + "/" + imagePath + rnd;
  }

  FileBase(): string {
    if (!oSettingsPortal.baseFiles) {
      return "";
    }
    return oSettingsPortal.host + oSettingsPortal.baseFiles;
  }

  DesktopBase(): string {
    return oSettingsPortal.host + oSettingsPortal.baseDesktop;
  }

  ResBase(): string {
    return oSettingsPortal.host + oSettingsPortal.baseRes;
  }

  Logo(): string {
    if (oSettingsPortal.logo) {
      return oSettingsPortal.logo;
    } else {
      return "assets/images/logo.svg"; // Из кабинета
    }
  }

  LogoSize(): LogoSize {
    return (oSettingsPortal.logoSize) ? oSettingsPortal.logoSize : "";
  }

  Users(): UsersSettingsInterface {
    return oSettingsEdu.features.users;
  }

  Registration(): RegistrationSettings {
    return oSettingsUsers.features.registration;
  }

  Restore(): RestoreSettings {
    return oSettingsUsers.features.restore;
  }

  Authentication(): AuthenticationSettings {
    return oSettingsUsers.features.authentication;
  }

  LoginSettings(): AuthenticationFieldSettings {
    const authSettings = this.Authentication();
    if (authSettings.standard.login) {
      return authSettings.standard.login;
    } else {
      const emptySettings: AuthenticationFieldSettings = {
        title: "",
        description: "",
        placeholder: ""
      };
      return emptySettings;
    }
  }

  Activities(): ActivitiesSettingsInterface {
    return oSettingsEdu.features.activities;
  }

  News(): NewsSettingsInterface {
    const settings = oSettingsEdu.features.news;
    if (!settings.fromLastDays) {
      settings.fromLastDays = 30;
    }
    return settings;
  }

  Communication(): CommunicationSettingsInterface {
    return oSettingsEdu.features.communication;
  }

  Library(): LibrarySettingsInterface {
    return oSettingsEdu.features.library;
  }

  ElectronicResources(): ElectronicResourcesSettingsInterface {
    return oSettingsEdu.features.electronicResources;
  }

  SentryAddress(): string {
    return (oSettingsPortal.sentry) ? oSettingsPortal.sentry : "";
  }

  DisplaySentryDialog(): boolean {
    return false; // TODO: DisplaySentryDialog
  }

  DisplayLog(): boolean {
    return (oSettingsPortal.displayLog) ? oSettingsPortal.displayLog : false;
  }

  private settingsLanguage(): Lang {
    return (oSettingsPortal.language) ? oSettingsPortal.language.substr(0, 2) as Lang : null;
  }

  Language(): Lang {

    const settingsLang = this.settingsLanguage();

    if (settingsLang) {
      return settingsLang;
    }

    if (this.AllowChangeUserLanguage()) {
      const userLanguage: Lang = localStorage.getItem(this.StorageName(this.userLanguageSettingsName)) as Lang;
      if (userLanguage) {
        return userLanguage;
      }
    }

    return null;

  }

  AllowChangeUserLanguage(): boolean {
    return (this.settingsLanguage()) ? false : true;
  }

  SaveUserLanguage(lang: Lang): void {
    localStorage.setItem(this.StorageName(this.userLanguageSettingsName), lang);
  }

  Footer(): string {
    if (oSettingsPortal.footer) {
      return oSettingsPortal.footer;
    }
    return "";
  }

  AvailablePinCodesOnStartPage(): boolean {
    return oSettingsPortal.availablePinCodesOnStartPage ? true : false;
  }

  BackendReportsIsAvailable(allocation: BackendReportsAllocation): boolean {
    return !!this.BackendReports(allocation).length;
  }

  BackendReports(allocation: BackendReportsAllocation): ReportSettingsAllocation[] {
    if (!oSettingsEdu.features.backendReports) {
      return [];
    }
    if (!oSettingsEdu.features.backendReports.allocations || !oSettingsEdu.features.backendReports.allocations.length) {
      return [];
    }
    if (!oSettingsEdu.features.backendReports.formats || !oSettingsEdu.features.backendReports.formats.length) {
      return [];
    }
    return oSettingsEdu.features.backendReports.allocations.filter(val => val.allocation === allocation);
  }

  BackendReportsFormats(): BackendReportsFormatType[] {
    if (!oSettingsEdu.features.backendReports || !oSettingsEdu.features.backendReports.formats || !oSettingsEdu.features.backendReports.formats.length) {
      return [backendReportsFormatTypes.HTML5];
    }
    return oSettingsEdu.features.backendReports.formats.map(val => val.type);
  }

}
