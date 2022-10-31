import { Component, HostListener, ElementRef, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '@modules/auth/auth.service';
import { SettingsService } from '../../settings/settings.service';
import { navElementNames, NavElementName, ProfileElement, NavBarElement } from '../nav.interface';
import { pages } from '@pages/pages.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { authIconVariants } from '@modules/auth/auth.interface';
import { takeUntil } from 'rxjs/operators';
import { ErrorsService } from '../../errors/errors.service';
import { NavService } from '../nav.service';
import { ProfileCommandVariant, profileCommandVariants } from '@modules/root/settings/settings.interface';
import { CurrentUserDescription } from '@modules/user/user.interface';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent extends AppComponentTemplate implements AfterViewInit {

  allElementNames = navElementNames;
  allPages = pages;
  centerElements: NavBarElement[] = [];
  logoPath = this.settings.Logo();
  profileVariants = profileCommandVariants;
  userDescription: CurrentUserDescription;

  profileElement: ProfileElement = {
    page: navElementNames.profile,
    emptyAvatarIconName: authIconVariants.EMPTY_AVATAR,
    avatarImagePath: ""
  };

  displayMoreElement = false;

  @HostListener('window:resize', ['$event'])
  onWindowResize($event) {
    this.updateMoreElements();
  }

  constructor(
    private auth: AuthService,
    private settings: SettingsService,
    private errors: ErrorsService,
    private nav: NavService,
    private el: ElementRef,
    private cd: ChangeDetectorRef) {

    super();

  }

  ngOnInit() {

    this.userDescription = this.auth.getUserDescription();

    this.auth.OnChangeUserData$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (userData) => {
          this.profileElement.avatarImagePath = userData.pathToAvatar(this.settings);
          this.userDescription = userData;
          this.cd.detectChanges(); // Обязательно
        },
        (err) => this.errors.register(err)
      );

    const availableCalendar = this.settings.Activities().availableCalendarPage;

    for (const elementName of Object.keys(this.allElementNames)) {
      const page = this.allPages.find((p) => p.name === elementName);
      if (!page) {
        continue;
      }
      if (!this.auth.IsPermission(page.permission)) {
        continue;
      }
      if (page.permissions && page.permissions.length) {
        const isTrue = !!page.permissions.map(val => this.auth.IsPermission(val)).filter(val => !!val).length;
        if (!isTrue) {
          continue;
        }
      }
      if (elementName === this.profileElement.page) {
        continue;
      }
      if (elementName === navElementNames.calendar && !availableCalendar) {
        continue;
      }
      const newElement: NavBarElement = {
        name: elementName as NavElementName,
        page: page,
        i18n: page.i18n
      };
      this.centerElements.push(newElement);
    }

  }

  ngAfterViewInit() {
    this.updateMoreElements();
  }

  moreElements(): NavBarElement[] {

    const nativeElements = this.el.nativeElement.getElementsByClassName('element');

    const elementIsVisible = (page: NavBarElement) => {
      for (const element of nativeElements) {
        if (element.getAttribute('pageName') === page.page.name && !!element.offsetParent) {
          return true;
        }
      }
      return false;
    };

    return this.centerElements.filter(val => !elementIsVisible(val));

  }

  updateMoreElements(): void {
    this.nav.UpdateMoreNavElementsData(this.moreElements());
    this.displayMoreElement = !!this.moreElements().length;
    this.cd.detectChanges(); // Обязательно
  }

  profileCommandVariant(): ProfileCommandVariant {
    const userSettings = this.settings.Users();
    if ('profileCommandVariant' in userSettings) {
      return userSettings.profileCommandVariant;
    }
    return profileCommandVariants.photo;
  }

  displayProfileName(): boolean {
    if (this.profileCommandVariant() === this.profileVariants.name) {
      return true;
    }
    if (this.profileCommandVariant() === this.profileVariants.nameAndPhoto) {
      return true;
    }
    return false;
  }

  displayProfileLogin(): boolean {
    if (this.profileCommandVariant() === this.profileVariants.login) {
      return true;
    }
    if (this.profileCommandVariant() === this.profileVariants.loginAndPhoto) {
      return true;
    }
    return false;
  }

  displayProfileAvatar(): boolean {
    if (this.profileCommandVariant() === this.profileVariants.loginAndPhoto) {
      return true;
    }
    if (this.profileCommandVariant() === this.profileVariants.nameAndPhoto) {
      return true;
    }
    if (this.profileCommandVariant() === this.profileVariants.photo) {
      return true;
    }
    return false;
  }

}
