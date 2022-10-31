export type FormFieldTypeInput  =  "text" | "email" | "password" | "number";
export type FormFieldTypeValue = "values" | "boolean" | "number" | "date" | "string";

export class FormField {
    id: string;
    name: string;
    typeInput: FormFieldTypeInput;
    required: boolean;
    confirm: boolean;
    confirmName: string;
    typeValue: FormFieldTypeValue;
    variants: {
        value: string;
        name: string;
    }[];
    description: string;
    labelAsHTML?: boolean; // Если Истина, то свойства name и confirmName могут содержать HTML
}

export interface FormFieldData {
    field: FormField;
    value: string;
    startValue: string;
    confirmedField: FormFieldData;
    source: any; // Хранит ссылку на объект-источник данных поля
}

