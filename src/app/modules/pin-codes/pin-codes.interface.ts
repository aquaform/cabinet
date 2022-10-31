import { AdditionalInformationElement } from '@modules/user/user.interface';

export class PinCodeFormData {

    pinCodeData: {
        value: string
    };

    additionalInformation: AdditionalInformationElement[];
    errorCode: string;
    isLoading: boolean;

    constructor() {
        this.pinCodeData = {
            value: ""
        };
        this.additionalInformation = [];
    }

    get optionValue(): string {
        if (this.additionalInformation && this.additionalInformation.length) {
            return this.additionalInformation[0].value;
        }
        return "";
    }
}
