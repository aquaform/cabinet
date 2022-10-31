import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav-bar/nav.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthModule } from '../../auth/auth.module';
import { IconModule } from '../icon/icon.module';
import { UserModule } from '@modules/user/user.module';
import { StartMobileHeaderComponent } from './start-mobile-header/start-mobile-header.component';
import { PrimaryBlockComponent } from './primary-block/primary-block.component';
import { LoaderModule } from '../loader/loader.module';
import { DatesModule } from '../dates/dates.module';


@NgModule({
  declarations: [
    NavComponent,
    StartMobileHeaderComponent,
    PrimaryBlockComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    AuthModule,
    IconModule,
    UserModule,
    LoaderModule,
    DatesModule
  ],
  exports: [
    NavComponent,
    StartMobileHeaderComponent,
    PrimaryBlockComponent
  ]
})
export class NavModule { }
