import { Component, HostBinding } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { Language } from '@modules/root/i18n/i18n.class';
import { TranslateService } from '@ngx-translate/core';
import { NavService } from '@modules/root/nav/nav.service';
import { takeUntil, delay } from 'rxjs/operators';
import { NavBarElement } from '@modules/root/nav/nav.interface';
import { ErrorsService } from '@modules/root/errors/errors.service';

@Component({
  selector: 'app-more',
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.scss']
})
export class MoreComponent extends AppComponentTemplate {

  @HostBinding('class.page-host') isPage = true;

  centerElements: NavBarElement[] = [];

  constructor(
    private translate: TranslateService,
    private nav: NavService,
    private err: ErrorsService
  ) {
    super();
    Language.init(this.translate);
  }

  ngOnInit() {

    this.nav.MoreNavElements$
    .pipe(takeUntil(this.ngUnsubscribe), delay(0)) // delay из-за мгновенного получения двух значений из подписки
    .subscribe(
      (elements) => this.centerElements = elements,
      (err) => this.err.register(err)
    );

  }

}
