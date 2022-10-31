import { Component, Input } from '@angular/core';
import { BookService } from '../book.service';
import { BookData, BookDescriptionData, BookDescription } from '../book.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { ApiService } from '@modules/root/api/api.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AuthService } from '@modules/auth/auth.service';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { environment } from '@environments/environment';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent extends AppComponentTemplate {

  @Input() data: BookData;

  isLoading = false;
  description: BookDescription;

  constructor(
    private bs: BookService,
    private api: ApiService,
    private err: ErrorsService,
    private auth: AuthService,
  ) {
    super();
  }

  ngOnInit() {
    this.getDescription();
  }

  close() {
    this.bs.Close();
  }

  getDescription() {

    this.api.Get<BookDescriptionData>(
      `book/${this.data.id}/description`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      BookDescriptionData,
      APIDataTypes.xml
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Book description:", response);
        }
        this.description = response.response.book;
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );

  }

}
