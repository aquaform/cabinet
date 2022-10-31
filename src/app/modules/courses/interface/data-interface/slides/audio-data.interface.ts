/**
 * Created by Baranoshnikov on 24.04.2017.
 */
import {ContentDataInterface} from "../course-data.interface";


// Поле с данными аудио
//
export interface AudioDataInterface {
    autoplay?: boolean;
    formats: AudioFormatDataInterface[];
    description?: ContentDataInterface;
}

// Форматы аудио
//
export interface AudioFormatDataInterface {
    type: string;
    file: string;
}
