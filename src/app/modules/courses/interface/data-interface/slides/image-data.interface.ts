/**
 * Created by Baranoshnikov on 29.06.2017.
 */


// Поле с данными картинки
//
export interface ImageDataInterface {
    path: string;
    width?: number;
    height?: number;
    areas?: ImageAreaInterface[];
}

// Области картинки
//
export interface ImageAreaInterface {
    href: string;
    shape: "circle" | "default" | "poly" | "rect";
    coords: string;
}