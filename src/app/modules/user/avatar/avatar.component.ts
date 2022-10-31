import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {

  @Input() path = "";
  @Input() big = false;
  @Input() medium = false;
  @Input() small = false;
  @Input() auto = false;
  @Input() default = false;

  constructor() { }

}
