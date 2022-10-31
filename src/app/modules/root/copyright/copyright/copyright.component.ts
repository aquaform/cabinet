import { Component, Input } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { SettingsService } from '@modules/root/settings/settings.service';

@Component({
  selector: 'app-copyright',
  templateUrl: './copyright.component.html',
  styleUrls: ['./copyright.component.scss']
})
export class CopyrightComponent extends AppComponentTemplate {

  @Input() displayVersion = false;
  footerText: string;
  version: string;

  constructor(
    private settings: SettingsService
  ) {
    super();
    this.footerText = this.settings.Footer();
    this.version = this.settings.Version();
  }

  ngOnInit() {
  }

}
