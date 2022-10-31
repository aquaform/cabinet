import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '@environments/environment';
import { SettingsService } from '@modules/root/settings/settings.service';
import { GetFileURLRequest, GetFileURLResponse, FileComponentInputData, GetFileNameResponse } from './file.interface';
import { ApiService } from '@modules/root/api/api.service';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { AuthService } from '@modules/auth/auth.service';
import { map, concatMap } from 'rxjs/operators';
import { ModalService } from '@modules/root/modal/modal.service';
import { modalComponentNames } from '@modules/root/modal/modal.interface';
import { DevicesTools } from '@modules/root/devices/devices.class';
import { FilesTools } from './file.class';
import { LocationTools } from '@modules/root/location/location.class';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private settings: SettingsService,
    private api: ApiService,
    private auth: AuthService,
    private modal: ModalService
  ) { }

  Open(id: string, name: string, ownerName?: string, ownerID?: string, onlyDownload?: boolean): Observable<void> {

    // name - имя без расширения
    // fileName - имя с расширением, которое получаем из url или базы

    if (environment.displayLog) {
      console.log("File is opening:", `${name} (${id})`);
    }

    ownerName = (ownerName) ? ownerName : "common";
    ownerID = (ownerID) ? ownerID : "common";

    const requestData: GetFileURLRequest = {
      baseDesktop: this.settings.DesktopBase(),
      baseFiles: this.settings.FileBase()
    };

    const open$ = (path: string, fileName: string): Observable<void> => {

      if (this.canBeOpenInWindow(fileName) && !onlyDownload) {

        const data: FileComponentInputData = {
          path: path,
          name: name,
          isAudio: FilesTools.isAudio(fileName),
          isImage: FilesTools.isImage(fileName),
          isPDF: FilesTools.isPDF(fileName),
          isVideo: FilesTools.isVideo(fileName),
          isHTML: false
        };

        this.modal.Display({
          component: modalComponentNames.file,
          data: data,
          maximizeSize: data.isPDF
        });

        return of();

      } else {

        return LocationTools.downloadFile(path, fileName, false);

      }

    };

    const getPath$ = (): Observable<{ path: string; fileName: string }> => {

      if (requestData.baseFiles) {

        return this.api.Get<GetFileURLResponse>(
          `file/url/${ownerName}/${ownerID}/${id}`,
          requestData,
          APIServiceNames.edu,
          this.auth.SearchParams(),
          GetFileURLResponse,
          APIDataTypes.text
        ).pipe(map((response) => {
          if (environment.displayLog) {
            console.log("File path: ", response);
          }
          return {
            path: response as string,
            fileName: FilesTools.fileNameFromURL(response as string)
          };
        }));

      } else {

        return this.api.Get<GetFileNameResponse>(
          `file/name/${ownerName}/${ownerID}/${id}`,
          {},
          APIServiceNames.edu,
          this.auth.SearchParams(),
          GetFileNameResponse,
          APIDataTypes.text
        ).pipe(map((response) => {

          if (environment.displayLog) {
            console.log("File name: ", response);
          }

          const path = this.settings.ServiceURL(APIServiceNames.edu)
            + `/file/download/${ownerName}/${ownerID}/${id}`
            + this.auth.SearchParams();

          const fileName = response as string;

          return {
            path: path,
            fileName: fileName
          };

        }));

      }

    };

    return getPath$().pipe(concatMap((data) => open$(data.path, data.fileName)));

  }

  private canBeOpenInWindow(urlOrFileName: string) {
    if (DevicesTools.isMobile()) {
      return FilesTools.isAudio(urlOrFileName) || FilesTools.isImage(urlOrFileName) || FilesTools.isVideo(urlOrFileName);
    }
    return FilesTools.isAudio(urlOrFileName) || FilesTools.isImage(urlOrFileName) || FilesTools.isPDF(urlOrFileName) || FilesTools.isVideo(urlOrFileName);
  }

  Icon(extension: string): string {
    if (!extension) {
      return "unknown";
    }
    extension = extension.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'mp3':
        return 'audio';
      case 'mp4':
        return 'video';
      case 'doc':
        return 'docs';
      case 'docx':
        return 'docs';
      case 'gif':
        return 'img';
      case 'jpg':
        return 'img';
      case 'png':
        return 'img';
      case 'webp':
        return 'img';
      case 'jpeg':
        return 'img';
      case 'pptx':
        return 'ppt';
      case 'ppt':
        return 'ppt';
      case 'xlsx':
        return 'xls';
      case 'xls':
        return 'xls';
      default:
        return 'unknown';
    }
  }

}
