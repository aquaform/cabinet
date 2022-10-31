import { Component, Input } from '@angular/core';
import { environment } from '@environments/environment';
import { AuthService } from '@modules/auth/auth.service';
import { FileComponentInputData } from '@modules/resources/file/file.interface';
import { APIServiceNames } from '@modules/root/api/api.interface';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { LocationTools } from '@modules/root/location/location.class';
import { modalComponentNames } from '@modules/root/modal/modal.interface';
import { ModalService } from '@modules/root/modal/modal.service';
import {
  BackendReportsAllocation,
  backendReportsAllocations,
  BackendReportsFormatType,
  backendReportsFormatTypes,
  ReportSettingsAllocation
} from '@modules/root/settings/settings.interface';
import { SettingsService } from '@modules/root/settings/settings.service';
import { AppComponentTemplate } from '@shared/component.template';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

class ReportSettingsAllocationComponent extends ReportSettingsAllocation {
  visibility: boolean;
}

@Component({
  selector: 'app-reports-from-backend',
  templateUrl: './reports-from-backend.component.html',
  styleUrls: ['./reports-from-backend.component.scss']
})
export class ReportsFromBackendComponent extends AppComponentTemplate {

  @Input() allocation: BackendReportsAllocation;
  @Input() providingEducation: string;
  @Input() educationTitle: string;

  formats: BackendReportsFormatType[];
  reports: ReportSettingsAllocationComponent[];
  allFormats = backendReportsFormatTypes;
  commandsIsAvailable = false;

  eduServiceURL = this.settings.ServiceURL(APIServiceNames.edu);
  backendReportsAllocations = backendReportsAllocations;
  isLoading = false;

  constructor(
    private settings: SettingsService,
    private auth: AuthService,
    private err: ErrorsService,
    private modal: ModalService
  ) {
    super();
  }

  ngOnInit(): void {

    this.formats = this.settings.BackendReportsFormats();
    this.reports = this.settings.BackendReports(this.allocation).map((val) => {
      const report: ReportSettingsAllocationComponent = {
        ...val,
        visibility: false
      };
      return report;
    });

    this.commandsIsAvailable = this.formats.length > 1 ? true : false;

    if (environment.displayLog) {
      console.log("Backend report formats:", this.formats);
      console.log("Backend reports:", this.reports);
    }

  }

  changeCommandsVisibility(report: ReportSettingsAllocationComponent) {
    report.visibility = !report.visibility;
  }

  formatIsAvailable(format: BackendReportsFormatType): boolean {
    return this.formats.indexOf(format) > -1;
  }

  reportLink(report: ReportSettingsAllocationComponent, format: BackendReportsFormatType): string {
    if (this.allocation === this.backendReportsAllocations.teacherActivityPage) {
      return `${this.eduServiceURL}/report/activity/get/${report.id}/${this.providingEducation}/${format}${this.auth.SearchParams()}`;
    }
    if (this.allocation === this.backendReportsAllocations.teacherPage) {
      return `${this.eduServiceURL}/report/teacher/get/${report.id}/${format}${this.auth.SearchParams()}`;
    }
    throw `${this.allocation} is not supported`;
  }

  openReport(report: ReportSettingsAllocationComponent, format?: BackendReportsFormatType): false {

    if (!format) {
      format = this.formats[0];
    }

    let fileName: string = report.title;

    if (this.educationTitle) {
      fileName = this.educationTitle + " - " + fileName;
    }

    if (format === this.allFormats.PDF || format === this.allFormats.HTML5) {

      this.isLoading = true;

      const url$: Observable<string> = new Observable((observer) => {

        const fileURL = this.reportLink(report, format);

        if ("fetch" in window) {

          fetch(this.reportLink(report, format))
            .then(resp => resp.blob())
            .then(blob => {
              const url = window.URL.createObjectURL(blob);
              observer.next(url);
              observer.complete();
            })
            .catch((err) => observer.error(err));

        } else {
          observer.next(fileURL);
          observer.complete();
        }

      });

      url$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        (url) => {
          const data: FileComponentInputData = {
            path: url,
            name: fileName,
            isAudio: false,
            isImage: false,
            isPDF: format === this.allFormats.PDF,
            isHTML: format === this.allFormats.HTML5,
            isVideo: false
          };
          this.isLoading = false;
          this.modal.Display({
            component: modalComponentNames.file,
            data: data,
            maximizeSize: true
          });
        },
        (err) => this.err.register(err),
        () => this.isLoading = false
      );

    }

    if (format === this.allFormats.XLSX) {

      this.isLoading = true;
      LocationTools.downloadFile(this.reportLink(report, format), fileName, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
          () => { },
          (err) => this.err.register(err),
          () => this.isLoading = false
        );
    }

    return false;

  }

}
