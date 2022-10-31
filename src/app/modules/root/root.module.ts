import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsModule } from './settings/settings.module';
import { ErrorsModule } from './errors/errors.module';
import { AlertModule } from './alert/alert.module';
import { ApiModule } from './api/api.module';
import { NavModule } from './nav/nav.module';
import { LoaderModule } from './loader/loader.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DatesModule } from './dates/dates.module';
import { InnerHTMLModule } from './inner-html/inner-html.module';
import { IconModule } from './icon/icon.module';
import { QuestionModule } from './question/question.module';
import { ModalModule } from './modal/modal.module';
import { SafeUrlModule } from './location/safe-url.module';
import { UploadModule } from './upload/upload.module';
import { AppFormsModule } from './forms/forms.module';
import { CopyrightModule } from './copyright/copyright.module';
import { IdleModule } from './idle/idle.module';
import { MarksModule } from './marks/marks.module';
import { EditorModule } from './editor/editor.module';
import { StatisticsModule } from './statistics/statistics.module';
import { YoutubeModule } from './youtube/youtube.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AlertModule,
    ApiModule,
    ErrorsModule,
    LoaderModule,
    NavModule,
    SettingsModule,
    NotificationsModule,
    DatesModule,
    InnerHTMLModule,
    IconModule,
    QuestionModule,
    ModalModule,
    SafeUrlModule,
    UploadModule,
    AppFormsModule,
    CopyrightModule,
    IdleModule,
    MarksModule,
    EditorModule,
    StatisticsModule,
    YoutubeModule
  ],
  exports: [
    CommonModule,
    AlertModule,
    ApiModule,
    ErrorsModule,
    LoaderModule,
    NavModule,
    SettingsModule,
    NotificationsModule,
    DatesModule,
    InnerHTMLModule,
    IconModule,
    QuestionModule,
    ModalModule,
    SafeUrlModule,
    UploadModule,
    AppFormsModule,
    CopyrightModule,
    IdleModule,
    MarksModule,
    EditorModule,
    StatisticsModule,
    YoutubeModule
  ]
})
export class RootModule { }
