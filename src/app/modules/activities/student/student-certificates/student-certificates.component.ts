import { Component } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { ApiService } from '@modules/root/api/api.service';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AuthService } from '@modules/auth/auth.service';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { takeUntil } from 'rxjs/operators';
import { StudentCertificatesListResponse, StudentCertificateListElement } from '../student.interface';
import { environment } from '@environments/environment';
import {studentIcons} from '../student.icons';
import { SettingsService } from '@modules/root/settings/settings.service';
import { ClipboardService } from 'ngx-clipboard';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-student-certificates',
  templateUrl: './student-certificates.component.html',
  styleUrls: ['./student-certificates.component.scss']
})
export class StudentCertificatesComponent extends AppComponentTemplate {

  isLoading: boolean;
  certificates: StudentCertificateListElement[] = [];
  studentIcons = studentIcons;

  constructor(
    private api: ApiService,
    private err: ErrorsService,
    private auth: AuthService,
    private settings: SettingsService,
    private clipboard: ClipboardService,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit() {
    this.getList();
  }

  getList() {

    this.isLoading = true;
    this.certificates = [];

    this.api.Get<StudentCertificatesListResponse>(
      `edu/certificates/list`,
      {},
      APIServiceNames.edu,
      this.auth.SearchParams(),
      StudentCertificatesListResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("Student certificates:", response);
        }
        if (response && response.length) {
          for (const element of response) {
            this.certificates.push(element.certificate);
          }
        }
      },
      (err) => this.err.register(err),
      () => this.isLoading = false
    );
  }

  open(certificate: StudentCertificateListElement) {
    certificate.displayCommands = !certificate.displayCommands;
  }

  HTMLLink(certificate: StudentCertificateListElement): string {
    return certificate.HTMLLink(this.settings, this.translate);
  }

  PDFLink(certificate: StudentCertificateListElement): string {
    return certificate.PDFLink(this.settings);
  }

  copyToClipboard(certificate: StudentCertificateListElement): false {
    this.clipboard.copyFromContent(this.HTMLLink(certificate));
    certificate.afterCopyToClipboard();
    return false;
  }

}
