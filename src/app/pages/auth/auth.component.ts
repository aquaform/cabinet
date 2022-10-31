import { Component } from '@angular/core';
import { Language } from '@modules/root/i18n/i18n.class';
import { TranslateService } from '@ngx-translate/core';
import { AppComponentTemplate } from '@shared/component.template';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent extends AppComponentTemplate {

  constructor(
    private translate: TranslateService,
  ) {
    super();
    Language.init(this.translate);
  }


}
