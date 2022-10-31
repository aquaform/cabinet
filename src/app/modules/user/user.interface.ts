import { SettingsService } from '@modules/root/settings/settings.service';
import { ArrayElementAPI, ObjectAPI, ConvertValueAPI, DateAPI } from '@modules/root/api/api.converter';
import { FormFieldTypeValue } from '@modules/root/forms/forms.interface';
import { FilesTools } from '@modules/resources/file/file.class';
import { YoutubeTools } from '@modules/root/youtube/youtube.class';
import { LocationTools } from '@modules/root/location/location.class';

// Общие любого пользователя
//
export class UserDescription {
    name: string;
    id: string;
    avatar: string;
    rndAvatarParam?: string;
    pathToAvatar(settings: SettingsService): string {
        return (this.avatar) ? settings.ImageURL(this.avatar, this.rndAvatarParam) : "";
    }
}

// Описание текущего пользователя
//
export class CurrentUserDescription extends UserDescription {
    login: string;
}

export class TeacherUserDescription extends UserDescription {
    roleName: string;
}

export class UserCardInputData {
    id: string;
    name: string;
}

export class ContactInformationElement {
    fieldValues: string;
    country: string;
    region: string;
    city: string;
    mail: string;
    host: string;
    phone: string;
    phoneWithoutCodes: string;
    type: "АдресЭлектроннойПочты" | "Адрес" | "Факс" | "ВебСтраница" | "Другое";
    kind: string;
    kindName: string;
    representation: string;
    // ДОБАВЛЕНО:
    get isText(): boolean {
        return (this.isEmail || this.isLink) ? false : true;
    }
    get isEmail(): boolean {
        return (this.type === "АдресЭлектроннойПочты") ? true : false;
    }
    get isLink(): boolean {
        return (this.type === "ВебСтраница" && !this.isVideo && !this.isYoutube) ? true : false;
    }
    get isVideo(): boolean {
        return (this.type === "ВебСтраница" && FilesTools.isVideo(this.representation) && !this.isYoutube) ? true : false;
    }
    get isYoutube(): boolean {
        return (this.type === "ВебСтраница" && YoutubeTools.isValid(this.representation)) ? true : false;
    }
    get isBoolean(): boolean {
        return false;
    }
    get getValue(): string {
        if (this.isLink && !LocationTools.isURL(this.representation)) {
            return "http://" + this.representation;
        }
        return this.representation;
    }
}



@ArrayElementAPI(ContactInformationElement)
export class ContactInformationElementArray extends Array<ContactInformationElement> {

}

export type AdditionalInformationTypeValue = "Строка" | "Дата" | "Число" | "Дополнительное значение" | "Булево" | "Свойства";

export const typeValueRusToEn = (val: AdditionalInformationTypeValue): FormFieldTypeValue => {

    switch (val) {
        case 'Булево':
            return 'boolean';
        case 'Дата':
            return 'date';
        case 'Дополнительное значение':
            return 'values';
        case 'Свойства':
            return 'values';
        case 'Строка':
            return 'string';
        case 'Число':
            return 'number';
        default:
            return 'string';
    }
};

export class AdditionalInformationVariant {
    value: string;
    name: string;
}

@ArrayElementAPI(AdditionalInformationVariant)
export class AdditionalInformationVariantsArray extends Array<AdditionalInformationVariant>  {
}

export class AdditionalInformationElement {
    property: string;
    value: string;
    textString: string;
    name: string;
    @ConvertValueAPI(typeValueRusToEn) typeValue: FormFieldTypeValue;
    propertyFormat: string;
    multipleLineInput: number;
    tooltip: string;
    @ObjectAPI(AdditionalInformationVariantsArray) variants: AdditionalInformationVariantsArray;
    // ДОБАВЛЕНО:
    get isText(): boolean {
        return !this.isBoolean;
    }
    get isEmail(): boolean {
        return false;
    }
    get isLink(): boolean {
        return false;
    }
    get isBoolean(): boolean {
        return typeof this.value === 'boolean';
    }
    get getValue(): string {
        if (this.isLink && !LocationTools.isURL(this.value)) {
            return "http://" + this.value;
        }
        return this.value;
    }
}

@ArrayElementAPI(AdditionalInformationElement)
export class AdditionalInformationElementArray extends Array<AdditionalInformationElement> {

}

export class StudentDescriptionElement {
    id: string;
    value: string;
    propertyName: string;
    title?: string;
}

@ArrayElementAPI(StudentDescriptionElement)
export class StudentDescriptionElementArray extends Array<StudentDescriptionElement> {

}

export class StudentInformation {
    @DateAPI() period: Date;
    @ObjectAPI(StudentDescriptionElementArray) properties: StudentDescriptionElementArray;
}

export class UserCardDescription {
    id: string;
    name: string;
    @ObjectAPI(ContactInformationElementArray) contactInformation: ContactInformationElementArray;
    @ObjectAPI(AdditionalInformationElementArray) additionalInformation: AdditionalInformationElementArray;
    photo: string;
    avatar: string;
    @ObjectAPI(StudentInformation) studentInformation: StudentInformation;
    unavailable: boolean; // Добавлено в 3.0.12.70
    pathToAvatar(settings: SettingsService): string {
        return (this.avatar) ? settings.ImageURL(this.avatar) : "";
    }
    pathToPhoto(settings: SettingsService): string {
        return (this.photo) ? settings.ImageURL(this.photo) : "";
    }
}
