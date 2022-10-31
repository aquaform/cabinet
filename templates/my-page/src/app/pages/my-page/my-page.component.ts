import { Component, HostBinding } from '@angular/core';
import { Language } from '@modules/root/i18n/i18n.class';
import { TranslateService } from '@ngx-translate/core';
import { AppComponentTemplate } from '@shared/component.template';

@Component({
  selector: 'app-rur-assessment',
  templateUrl: './my-page.component.html',
  styleUrls: ['./my-page.component.scss']
})
export class MyPageComponent extends AppComponentTemplate  {

  @HostBinding('class.page-host') isPage = true;

  constructor(
    private translate: TranslateService,
  ) {
    super();
    Language.init(this.translate);
  }

  ngOnInit(): void {
  }

}
