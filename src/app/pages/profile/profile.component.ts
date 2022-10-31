import { Component, OnInit, HostBinding } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '@modules/root/i18n/i18n.class';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  @HostBinding('class.page-host') isPage = true;

  constructor(private translate: TranslateService) {
    Language.init(this.translate);
  }

  ngOnInit() {
  }

}
