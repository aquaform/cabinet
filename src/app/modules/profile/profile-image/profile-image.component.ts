import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { AuthService } from '@modules/auth/auth.service';
import { UserDescription } from '@modules/user/user.interface';
import { UploadFileResponse, AfterSelectFileData } from '@modules/root/upload/upload.interface';
import { AppComponentTemplate } from '@shared/component.template';
import { Subject } from 'rxjs';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { environment } from '@environments/environment';
import { ApiService } from '@modules/root/api/api.service';
import {
  ProfileUploadAvatarRequest,
  ProfileUploadAvatarResponse,
  ProfileSettingsResponse,
  ProfileDeletePhotoRequest,
  ProfileDeletePhotoResponse
} from '../profile.interface';
import { base64URLToData } from '@modules/root/upload/upload.tools';
import { APIServiceNames, APIDataTypes } from '@modules/root/api/api.interface';
import { takeUntil } from 'rxjs/operators';
import { SettingsService } from '@modules/root/settings/settings.service';

@Component({
  selector: 'app-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss']
})
export class ProfileImageComponent extends AppComponentTemplate {

  @Input() settingsData: ProfileSettingsResponse;
  @Output() afterChangeImages = new EventEmitter<void>();

  userDescription: UserDescription;
  isLoading: boolean;

  startUploadBigPhoto$: Subject<void> = new Subject();

  imageFile: File;
  croppedImageBase64 = "";

  Settings: SettingsService;

  constructor(
    private auth: AuthService,
    private err: ErrorsService,
    private api: ApiService,
    private settings: SettingsService
  ) {
    super();
    this.userDescription = this.auth.getUserDescription();
    this.Settings = this.settings;
  }

  ngOnInit() {
    this.clearAll();
  }

  clearAll() {
    this.imageFile = null;
    this.croppedImageBase64 = "";
    this.setLoading(false);
  }

  setLoading(value: boolean) {
    this.isLoading = value;
  }

  afterSelectFile(data: AfterSelectFileData) {
    if (environment.displayLog) {
      console.log("After select image file:", data);
    }
    this.imageFile = data.file;
  }

  imageCropped(value: ImageCroppedEvent) {
    if (environment.displayLog) {
      console.log("Image crop data:", value);
    }
    this.croppedImageBase64 = value.base64;
  }

  loadImageFailed(evt: any) {
    this.err.register("Wrong image file type");
    this.clearAll();
  }

  startUploadImages() {
    this.setLoading(true);
    this.uploadBigPhoto();
  }

  uploadBigPhoto() {
    this.startUploadBigPhoto$.next();
  }

  afterErrorUploadBigPhoto(err: any) {
    this.clearAll();
  }

  afterUploadBigPhoto(response: UploadFileResponse) {
    this.uploadAvatar();
  }

  uploadAvatar() {

    const requestData: ProfileUploadAvatarRequest = {
      avatar: base64URLToData(this.croppedImageBase64)
    };

    this.api.Get<ProfileUploadAvatarResponse>(
      `userSettings/save`,
      requestData,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      ProfileUploadAvatarResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("After upload avatar:", response);
        }
        this.endUploadImages();
      },
      (err) => this.err.register(err)
    );

  }

  endUploadImages() {
    this.auth.UpdateUseDescription(null, true);
    this.afterChangeImages.emit();
    this.clearAll();
  }

  deleteAllPhoto() {

    this.setLoading(true);

    const requestData: ProfileDeletePhotoRequest = {
      avatar: "",
      photo: ""
    };

    this.api.Get<ProfileDeletePhotoResponse>(
      `userSettings/save`,
      requestData,
      APIServiceNames.edu,
      this.auth.SearchParams(),
      ProfileDeletePhotoResponse,
      APIDataTypes.json
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {
        if (environment.displayLog) {
          console.log("After delete photo:", response);
        }
        this.afterChangeImages.emit();
      },
      (err) => this.err.register(err),
      () => this.setLoading(false)
    );
  }

}
