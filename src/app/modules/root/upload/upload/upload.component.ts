import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { environment } from '@environments/environment';
import { AppComponentTemplate } from '@shared/component.template';
import { Observable } from 'rxjs';
import { concatMap, takeUntil } from 'rxjs/operators';
import { ApiService } from '@modules/root/api/api.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AuthService } from '@modules/auth/auth.service';
import { UploadFileResponse, AfterSelectFileData, FileToUpload } from '../upload.interface';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { fileToBase64 } from '../upload.tools';
import { SettingsService } from '@modules/root/settings/settings.service';
import { AlertService } from '@modules/root/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent extends AppComponentTemplate {

  @Input() label: string;
  @Input() ownerType: string;
  @Input() ownerID: string;
  @Input() disabled: boolean;
  @Input() autoUpload = true;
  @Input() clearAfterSelect = true;
  @Input() startUpload: Observable<void> = null;

  @Output() loading = new EventEmitter<boolean>();
  @Output() afterSelect = new EventEmitter<AfterSelectFileData>();
  @Output() afterUpload = new EventEmitter<UploadFileResponse>();
  @Output() afterErrorUpload = new EventEmitter<any>();

  @ViewChild("fileInput", { static: true }) fileInputVariable: any;

  isLoading = false;
  maxFileSize = 0; // В мегабайтах

  constructor(
    private api: ApiService,
    private err: ErrorsService,
    private auth: AuthService,
    private settings: SettingsService,
    private alert: AlertService,
    private translate: TranslateService,
  ) {
    super();
  }

  ngOnInit() {
    const activitySettings = this.settings.Activities();
    this.maxFileSize = (('maxFileSize' in activitySettings) ? activitySettings.maxFileSize : 0);

    if (this.startUpload) {
      this.startUpload.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          () => this.uploadFile(),
          (err) => this.err.register(err)
        );
    }
  }

  private clearFileInput() {
    this.fileInputVariable.nativeElement.value = "";
  }

  selectFileInput() {
    this.fileInputVariable.nativeElement.click();
  }

  onChangeFileInput() {
    if (this.autoUpload) {
      this.uploadFile();
    } else {
      this.afterSelect.emit({
        file: this.selectedFile()
      });
      if (this.clearAfterSelect) {
        this.clearFileInput();
      }
    }
  }

  private selectedFile(): File {
    const fileList = this.fileInputVariable.nativeElement.files as FileList;
    const nativeFiles: File[] = Array.from(fileList);
    if (!nativeFiles || !nativeFiles.length) {
      return null;
    }
    return nativeFiles[0];
  }

  private uploadFile() {

    const file: File = this.selectedFile();

    if (!file) {
      this.err.register("Nothing to upload");
      return;
    }

    if (environment.displayLog) {
      console.log("Native file:", file);
    }

    if (this.maxFileSize && file.size > this.maxFileSize * 1000000) {
      this.translate.get("FILES.MAX_FILE_SIZE", {maxFileSize: this.maxFileSize}).subscribe(
        (messageText) => this.alert.Open({ text: messageText }),
        (err) => this.err.register(err)
      );
      return;
    }

    this.setLoading(true);

    const upload$ = (base64FileData: string): Observable<UploadFileResponse> => {
      const fileToUpload: FileToUpload = {
        description: file,
        base64Data: base64FileData
      };
      const dataToSend = {
        files: [fileToUpload]
      };
      return this.api.Get<UploadFileResponse>(
        `file/upload/${this.ownerType}/${this.ownerID}`,
        dataToSend,
        APIServiceNames.edu,
        this.auth.SearchParams(),
        UploadFileResponse,
        APIDataTypes.json,
        true
      ).pipe(takeUntil(this.ngUnsubscribe));
    };

    fileToBase64(file)
      .pipe(concatMap((base64FileData) => upload$(base64FileData)))
      .subscribe({
        next: (response) => {
          if (environment.displayLog) {
            console.log("Upload response:", response);
          }
          this.afterUpload.emit(response);
        },
        error: err => {
          this.err.register(err);
          this.afterErrorUpload.emit(err);
        },
        complete: () => {
          this.setLoading(false);
          this.clearFileInput();
        }
      });

  }

  private setLoading(value: boolean) {
    this.loading.emit(value);
    this.isLoading = value;
  }



}
