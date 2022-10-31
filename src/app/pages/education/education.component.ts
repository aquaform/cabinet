import { Component, HostBinding } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '@modules/root/i18n/i18n.class';
import { AppComponentTemplate } from '@shared/component.template';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.scss']
})
export class EducationComponent extends AppComponentTemplate {

  @HostBinding('class.page-host') isPage = true;

  constructor(private translate: TranslateService) {
      super();
      Language.init(this.translate);
  }

}
