import { Component, Input } from '@angular/core';
import { ProfilePinCodesSettings } from '@modules/profile/profile.interface';


@Component({
  selector: 'app-pin-codes-list',
  templateUrl: './pin-codes-list.component.html',
  styleUrls: ['./pin-codes-list.component.scss']
})
export class PinCodesListComponent {

  @Input() pinCodes: ProfilePinCodesSettings;

  constructor() { }

}
