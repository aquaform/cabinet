/**
 * Created by Baranoshnikov on 24.04.2017.
 */
import {ContentDataInterface} from "../course-data.interface";


// Поле с данными видео
//
export interface VideoDataInterface {
    autoplay?: boolean;
    poster?: string;
    description?: ContentDataInterface;
    formats: VideoFormatDataInterface[];
    isExternal: boolean;
}

// Форматы видео
//
export interface VideoFormatDataInterface {
    type: string;
    file: string;
}
