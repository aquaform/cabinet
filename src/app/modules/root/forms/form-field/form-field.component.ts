import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { FormFieldData } from '../forms.interface';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
})
export class FormFieldComponent implements OnInit {

  @Input() fieldData: FormFieldData;
  @Input() readonly: boolean;

  fieldId: string;
  confirmErrorText: string;

  constructor(
    private translate: TranslateService,
    private err: ErrorsService
  ) {

  }

  ngOnInit() {
    this.fieldId = this.getFieldId();
    this.translate.get("FORM.CONFIRM_ERROR").subscribe(
      (value) => this.confirmErrorText = value,
      (err) => this.err.register(err)
    );
  }

  getFieldId(): string {
    let fieldId = this.fieldData.field.id;
    if (this.fieldData.confirmedField) {
      fieldId += "_confirm";
    }
    return fieldId;
  }

  onChangeField() {
    const inputElement = document.getElementById(this.fieldId) as HTMLInputElement | HTMLSelectElement;
    if (this.fieldData.confirmedField && this.fieldData.value !== this.fieldData.confirmedField.value) {
      inputElement.setCustomValidity(this.confirmErrorText);
    } else {
      inputElement.setCustomValidity("");
    }
  }

}
