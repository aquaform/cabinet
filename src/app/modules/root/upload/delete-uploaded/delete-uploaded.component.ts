import { Component, Input, HostListener, Output, EventEmitter, HostBinding } from '@angular/core';
import { ApiService } from '@modules/root/api/api.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AuthService } from '@modules/auth/auth.service';
import { DeleteUploadedFileResponse } from '../upload.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { QuestionService } from '@modules/root/question/question.service';
import { TranslateService } from '@ngx-translate/core';
import { questionAnswers } from '@modules/root/question/question.interface';

@Component({
  selector: 'app-delete-uploaded',
  templateUrl: './delete-uploaded.component.html',
  styleUrls: ['./delete-uploaded.component.scss']
})
export class DeleteUploadedComponent extends AppComponentTemplate {

  @Input() ownerType: string;
  @Input() ownerID: string;
  @Input() fileID: string;
  @Input() @HostBinding("class.hidden") disabled = false;

  @Output() loading = new EventEmitter<boolean>();
  @Output() afterDelete = new EventEmitter<{fileID: string}>();

  isLoading = false;

  constructor(
    private api: ApiService,
    private err: ErrorsService,
    private auth: AuthService,
    private question: QuestionService,
    private translate: TranslateService,
  ) {
    super();
  }

  @HostListener("click") onClick() {
    this.displayCompleteQuestion();
  }

  displayCompleteQuestion() {

    if (this.disabled) {
      return;
    }

    this.translate.get('FILES.DELETE_QUESTION').subscribe(
      (text) => {
        this.question.Open({text: text}).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
          (result) => {
            if (result === questionAnswers.yes) {
              this.deleteFile();
            }
          },
          (err) => this.err.register(err)
        );
      },
      (err) => this.err.register(err)
    );
  }

  private deleteFile() {

    this.setLoading(true);

    this.api.Get<DeleteUploadedFileResponse>(
      `file/delete/${this.ownerType}/${this.ownerID}/${this.fileID}`,
      "",
      APIServiceNames.edu,
      this.auth.SearchParams(),
      DeleteUploadedFileResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (environment.displayLog) {
          console.log("After delete file:", response);
        }
        this.afterDelete.emit({fileID: this.fileID});
      },
      error: (err) => this.err.register(err),
      complete: () => this.setLoading(false)
    });

  }

  private setLoading(value: boolean) {
    this.loading.emit(value);
    this.isLoading = value;
  }

}
