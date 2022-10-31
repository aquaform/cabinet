import { Component, Input } from '@angular/core';
import { AppComponentTemplate } from '@shared/component.template';
import { EduStudentActivityDescription } from '../../student.interface';
import { UploadFileResponse } from '@modules/root/upload/upload.interface';

@Component({
  selector: 'app-activity-user-files',
  templateUrl: './activity-user-files.component.html',
  styleUrls: ['./activity-user-files.component.scss']
})
export class ActivityUserFilesComponent extends AppComponentTemplate {

  @Input() activity: EduStudentActivityDescription;
  isLoading = false;

  constructor() {
    super();
  }

  ngOnInit() {
  }

  deleteUserFileFromClientList(response: { fileID: string }) {
    this.activity.deleteUserFile(response.fileID);
  }

  addUserFileToClientList(response: UploadFileResponse) {
    if (!response) {
      return;
    }
    for (const newFile of response) {
      this.activity.addUserFile(newFile.ref, newFile.name, newFile.extension);
    }
  }

  setLoading(value: boolean) {
    this.isLoading = value;
  }

}
