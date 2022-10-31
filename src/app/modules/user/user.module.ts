import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserCardComponent } from './user-card/user-card.component';
import { LoaderModule } from '@modules/root/loader/loader.module';
import { AvatarComponent } from './avatar/avatar.component';
import { IconModule } from '@modules/root/icon/icon.module';
import { UserListElementComponent } from './list/user-list-element/user-list-element.component';
import { UserPhotoComponent } from './user-photo/user-photo.component';
import { TranslateModule } from '@ngx-translate/core';
import { SafeUrlModule } from '@modules/root/location/safe-url.module';


@NgModule({
  declarations: [UserCardComponent, AvatarComponent, UserListElementComponent, UserPhotoComponent],
  imports: [
    CommonModule,
    LoaderModule,
    IconModule,
    TranslateModule,
    SafeUrlModule
  ],
  exports: [
    UserCardComponent,
    AvatarComponent,
    UserListElementComponent,
    UserPhotoComponent
  ]
})
export class UserModule { }
