/**
 * Created by Baranoshnikov on 13.08.2017.
 */
import {ContentDataInterface} from "../course-data.interface";


// Поле с данными видео
//
export interface YouTubeDataInterface {
    autoplay?: boolean;
    id: string;
    description?: ContentDataInterface;
}