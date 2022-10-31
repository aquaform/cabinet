import { Component } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { MessagesService } from '../messages.service';
import { MessageUserCatalog, MessageUser } from '../messages.interface';
import { Observable } from 'rxjs';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-messages-contacts',
  templateUrl: './messages-contacts.component.html',
  styleUrls: ['./messages-contacts.component.scss']
})
export class MessagesContactsComponent extends AppComponentTemplate {

  allUsers: MessageUser[] = [];

  catalog: Observable<MessageUserCatalog> = this.messages.UserCatalog$()
    .pipe(
      catchError(this.catchError(this.err)),
      tap((currentCatalog) => this.allUsers = currentCatalog.allUsers)
    );

  constructor(
    private messages: MessagesService,
    private err: ErrorsService,
  ) {
    super();
  }

  displayNewMessageForm(userID: string) {
    const user = this.allUsers.find(val => val.id === userID);
    if (environment.displayLog) {
      console.log("Selected user:", user);
    }
    if (user) {
      this.messages.DisplayNewMessageForm(user);
    }
  }

}
