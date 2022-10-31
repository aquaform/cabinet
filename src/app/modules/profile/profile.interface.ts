import { ObjectAPI, DateAPI, ArrayElementAPI } from '@modules/root/api/api.converter';
import { AdditionalInformationElement } from '@modules/user/user.interface';
import { FormFieldData, FormFieldTypeInput, FormFieldTypeValue } from '@modules/root/forms/forms.interface';
import { PinCodeFormData } from '@modules/pin-codes/pin-codes.interface';
import { SettingsService } from '@modules/root/settings/settings.service';

/* Получение */

export type ProfileContactType = "АдресЭлектроннойПочты" | "Адрес" | "Факс" | "ВебСтраница" | "Другое";

export class ProfileContactInformation {
    representation: string;
    numString: number;
    kind: string;
    kindName: string;
    denyUserEditing: false;
    type: ProfileContactType;
    namePredefinedData: string;
    // ДОБАВЛЕНО:
    get typeInput(): FormFieldTypeInput {
        if (this.type === "АдресЭлектроннойПочты") {
            return "email";
        }
        return "text";
    }
    get typeValue(): FormFieldTypeValue {
        return "string";
    }
}



@ArrayElementAPI(ProfileContactInformation)
export class ProfileContactInformationArray extends Array<ProfileContactInformation>  {
    // ДОБАВЛЕНО:
    get formFieldsData(): FormFieldData[] {
        return this.map((val) => {
            const field: FormFieldData = {
                field: {
                    id: val.kind + ((val.numString) ?  "_" + String(val.numString) : ""),
                    name: val.kindName,
                    typeInput: val.typeInput,
                    required: false,
                    typeValue: val.typeValue,
                    variants: null,
                    description: "",
                    confirm: false,
                    confirmName: "",
                },
                value: val.representation,
                startValue: val.representation,
                confirmedField: null,
                source: val
            };
            return field;
        });
    }
}

export class ProfileAdditionalInformationVariant {
    value: string;
    name: string;
}

@ArrayElementAPI(ProfileAdditionalInformationVariant)
export class ProfileAdditionalInformationVariantsArray extends Array<ProfileAdditionalInformationVariant>  {
}

export class ProfileAdditionalInformation extends AdditionalInformationElement {
    // ДОБАВЛЕНО:
    get typeInput(): FormFieldTypeInput {
        if (this.typeValue === "number") {
            return "number";
        }
        return "text";
    }
}

@ArrayElementAPI(ProfileAdditionalInformation)
export class ProfileAdditionalInformationArray extends Array<ProfileAdditionalInformation> {
    // ДОБАВЛЕНО:
    get formFieldsData(): FormFieldData[] {
        return this.map((val) => {
            const field: FormFieldData = {
                field: {
                    id: val.property,
                    name: val.name,
                    typeInput: val.typeInput,
                    required: false,
                    typeValue: val.typeValue,
                    variants: val.variants,
                    description: val.tooltip,
                    confirm: false,
                    confirmName: ""
                },
                value: val.value,
                startValue: val.value,
                confirmedField: null,
                source: val
            };
            return field;
        });
    }
}

export class ProfilePinCodesListElement {
    description: string;
    pinCode: string;
    @DateAPI() usedDate: Date;
    optionName: string;
}

@ArrayElementAPI(ProfilePinCodesListElement)
export class ProfilePinCodesListElementArray extends Array<ProfilePinCodesListElement> {

}

export class ProfilePinCodesSettings {
    using: boolean;
    @ObjectAPI(ProfilePinCodesListElementArray) list: ProfilePinCodesListElementArray;
}

export class ProfileAccessTime {
    @DateAPI() startDateAccess: Date;
    @DateAPI() endDateAccess: Date;
}

export class ProfileSettingsResponse {
    hideContactInformation: boolean;
    denyMailing: boolean;
    hideAdditionalInformation: boolean;
    denyNewMessagesMailing: boolean;
    denyNewForumTopicsMailing: boolean;
    @ObjectAPI(ProfileContactInformationArray) contactInformation: ProfileContactInformationArray;
    @ObjectAPI(ProfileAdditionalInformationArray) additionalInformation: ProfileAdditionalInformationArray;
    photo: string;
    @ObjectAPI(ProfilePinCodesSettings) pinCodes: ProfilePinCodesSettings;
    @ObjectAPI(ProfileAccessTime) accessTime: ProfileAccessTime;
    pathToPhoto(settings: SettingsService): string {
        return (this.photo) ? settings.ImageURL(this.photo) : "";
    }
}

/* Сохранение */

export class ProfileSettingsSaveContactsValue {
    num: number;
    value: string;
    kind: string;
    type: ProfileContactType;
}

export class ProfileSettingsSaveAdditionalInfo {
    propertyId: string;
    typeValue: FormFieldTypeValue;
    value: string | number | boolean;
}

export class ProfileSettingsSaveRequest {
    denyMailing?: boolean;
    denyNewMessagesMailing?: boolean;
    denyNewForumTopicsMailing?: boolean;
    hideContactInformation?: boolean;
    hideAdditionalInformation?: boolean;
    contacts?: ProfileSettingsSaveContactsValue[];
    additionalInfo?: ProfileSettingsSaveAdditionalInfo[];
}

export class ProfileSettingsSaveResponse {
    operationComplete: boolean;
}

export class ProfileUploadAvatarRequest {
    avatar: string;
}

export class ProfileUploadAvatarResponse {
    operationComplete: boolean;
}

export class ProfileDeletePhotoRequest {
    photo: "";
    avatar: "";
}

export class ProfileDeletePhotoResponse {
    operationComplete: boolean;
}

/* Форма */

export class ProfileSettingsFixedFormData {
    denyMailing: FormFieldData;
    denyNewMessagesMailing: FormFieldData;
    denyNewForumTopicsMailing: FormFieldData;
    hideContactInformation: FormFieldData;
    hideAdditionalInformation: FormFieldData;
}

export class ProfileSettingsFormData extends ProfileSettingsFixedFormData {
    contacts: FormFieldData[];
    additionalInfo: FormFieldData[];
}

export class ProfileChangePasswordFormData {
    password: FormFieldData;
    passwordConfirm: FormFieldData;
}

export class ProfileChangePasswordRequest {
    changePasswordData: {
        name: "password",
        value: string
    }[];
}

export class ProfileChangePasswordResponse {
    operationComplete: boolean;
}

export class ProfilePinCodeFormData extends PinCodeFormData {

}

export class ProfileActivatePinCodeRequest {
    pinCode: string;
    pinCodeOption?: string;
}

export class ProfilePinCodeAdditionalInformation extends AdditionalInformationElement {
    property: "pinCodeOption";
}

export class ProfileActivatePinCodeResponse {
    series: string;
    code: string;
    option: string;
    availableForActivate: boolean;
    requiredOption: boolean;
    codeError: "noPinCode" | "disabledPinCode" | "usedPinCode";
    textError: string;
    notification: string;
    @ObjectAPI(ProfilePinCodeAdditionalInformation) availableOptions: ProfilePinCodeAdditionalInformation;
}
