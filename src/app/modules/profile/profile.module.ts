import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { TranslateModule } from '@ngx-translate/core';
import { RootModule } from '@modules/root/root.module';
import { FormsModule } from '@angular/forms';
import { PinCodesModule } from '@modules/pin-codes/pin-codes.module';
import { ProfileImageComponent } from './profile-image/profile-image.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { UserModule } from '@modules/user/user.module';
import { ModalModule } from '@modules/root/modal/modal.module';

@NgModule({
  declarations: [ProfileSettingsComponent, ProfileImageComponent],
  imports: [
    CommonModule,
    TranslateModule,
    RootModule,
    FormsModule,
    PinCodesModule,
    ImageCropperModule,
    UserModule,
    ModalModule
  ],
  exports: [
    ProfileSettingsComponent
  ]
})
export class ProfileModule { }
