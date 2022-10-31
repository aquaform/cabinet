import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterPinComponent } from './register-pin/register-pin.component';
import { FormsModule } from '@angular/forms';
import { RootModule } from '@modules/root/root.module';
import { TranslateModule } from '@ngx-translate/core';
import { PinCodesListComponent } from './pin-codes-list/pin-codes-list.component';
import { PinCodesBlockComponent } from './pin-codes-block/pin-codes-block.component';



@NgModule({
  declarations: [
    RegisterPinComponent,
    PinCodesListComponent,
    PinCodesBlockComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RootModule,
    TranslateModule
  ],
  exports: [
    RegisterPinComponent,
    PinCodesListComponent,
    PinCodesBlockComponent,
  ]
})
export class PinCodesModule { }
