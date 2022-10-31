import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader.component';
import { TranslateModule } from '@ngx-translate/core';
import { WithLoadingPipe } from './loader-async.pipe';


@NgModule({
  declarations: [LoaderComponent, WithLoadingPipe],
  imports: [
    CommonModule,
    TranslateModule,
  ],
  exports: [
    LoaderComponent,
    WithLoadingPipe
  ]
})
export class LoaderModule { }
