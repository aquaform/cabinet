import { Component, OnInit, Input, HostBinding, Output, EventEmitter } from '@angular/core';
import { UserService } from '@modules/user/user.service';
import { SettingsService } from '@modules/root/settings/settings.service';

@Component({
  selector: 'app-user-list-element',
  templateUrl: './user-list-element.component.html',
  styleUrls: ['./user-list-element.component.scss']
})
export class UserListElementComponent implements OnInit {

  @Input() id: string;
  @Input() name: string;
  @Input() avatar: string;
  @Input() @HostBinding("class.displayBorder") displayBorder: boolean;
  @Input() mediumSize: boolean;
  @Input() smallSize: boolean;
  @Input() openUserOnlyFromAvatar: boolean;
  @Input() commandButtonName: string;
  @Input() emptyDescription = false;

  @Output() clickByTitle = new EventEmitter<string>();
  @Output() emitCommand = new EventEmitter<string>();

  constructor(
    private user: UserService,
    private settings: SettingsService,
  ) {

  }

  ngOnInit() {
  }

  avatarClick() {
    this.displayUser();
  }

  titleClick() {
    if (this.openUserOnlyFromAvatar) {
      this.clickByTitle.emit(this.id);
      return;
    }
    this.displayUser();
  }

  allTitleClick() {
    if (this.commandButtonName) {
      return;
    }
    this.titleClick();
  }

  onlyNameClick() {
    if (!this.commandButtonName) {
      return;
    }
    this.titleClick();
  }

  displayUser() {
    this.user.Open(this.id, this.name);
  }

  pathToAvatar(): string {
    return (this.avatar) ? this.settings.ImageURL(this.avatar) : "";
  }

  doCommand() {
    this.emitCommand.emit(this.id);
  }

}
