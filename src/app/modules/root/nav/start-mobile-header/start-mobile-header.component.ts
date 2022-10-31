import { Component } from '@angular/core';
import { SettingsService } from '@modules/root/settings/settings.service';
import { ProfileElement, navElementNames } from '../nav.interface';
import { authIconVariants } from '@modules/auth/auth.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { AuthService } from '@modules/auth/auth.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { takeUntil } from 'rxjs/operators';
import { LogoSize, logoSizes } from '@modules/root/settings/settings.interface';

@Component({
  selector: 'app-start-mobile-header',
  templateUrl: './start-mobile-header.component.html',
  styleUrls: ['./start-mobile-header.component.scss']
})
export class StartMobileHeaderComponent extends AppComponentTemplate {

  logoPath = this.settings.Logo();
  logoSize: LogoSize = this.settings.LogoSize();
  logoSizes = logoSizes;

  title = this.settings.Title();

  profileElement: ProfileElement = {
    page: navElementNames.profile,
    emptyAvatarIconName: authIconVariants.EMPTY_AVATAR,
    avatarImagePath: ""
  };

  constructor(
    private settings: SettingsService,
    private auth: AuthService,
    private errors: ErrorsService
  ) {

    super();

    this.auth.OnChangeUserData$
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(
      (userData) => {
        this.profileElement.avatarImagePath = userData.pathToAvatar(this.settings);
      },
      (err) => this.errors.register(err)
    );

  }

  ngOnInit() {
  }

}
