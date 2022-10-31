import { Component, HostBinding } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '@modules/root/i18n/i18n.class';

@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarPageComponent {

  @HostBinding('class.page-host') isPage = true;

  constructor(private translate: TranslateService) {
    Language.init(this.translate);
  }

}
