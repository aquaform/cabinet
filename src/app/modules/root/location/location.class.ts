import { Observable } from "rxjs";
import { AnyObject } from "../../../shared/common.interface";

export class LocationTools {

    public static SearchToArray(strURL: string): AnyObject {

        const resultArray = {};

        if (!strURL) {
            return resultArray;
        }

        strURL = strURL.substring(strURL.indexOf('?') + 1, strURL.length);

        const strArray = strURL.split('&');

        for (const index of Object.keys(strArray)) {

            const strPropArray = strArray[index].split('=');

            strPropArray[1] = strPropArray[1].replace(/\+/g, ' ');
            strPropArray[1] = strPropArray[1].replace(/#x26/g, '&');
            strPropArray[1] = strPropArray[1].replace(/#x3D/g, '=');
            strPropArray[1] = strPropArray[1].replace(/#x2B/g, '+');
            strPropArray[1] = strPropArray[1].replace(/#x3F/g, '?');

            if (strPropArray[0] in resultArray) {

                const valueProp = resultArray[strPropArray[0]];

                if (typeof (valueProp) === 'string') {
                    resultArray[strPropArray[0]] = [];
                    resultArray[strPropArray[0]].push(valueProp);
                }

                resultArray[strPropArray[0]].push(strPropArray[1]);

            } else {

                resultArray[strPropArray[0]] = strPropArray[1];

            }

        }

        return resultArray;

    }

    public static isURL(str: string): boolean {
        let url: URL;
        try {
            url = new URL(str);
        } catch (_) {
            return false;
        }
        return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "data:";
    }

    public static URLWithoutProtocol(str: string): string {
        return str.replace(/https?:\/\//i, "");
    }

    public static isDataURL(str: string): boolean {
        return typeof str === "string" && str.startsWith("data:");
    }

    public static downloadFile(path: string, fileName: string, useFetch: boolean): Observable<void> {
        return new Observable((observer) => {

            if (useFetch && "fetch" in window) {

                fetch(path)
                    .then(resp => resp.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.style.display = 'none';
                        link.href = url;
                        link.download = fileName;
                        document.body.appendChild(link);
                        link.click();
                        window.URL.revokeObjectURL(url);
                        observer.next();
                        observer.complete();
                    })
                    .catch((err) => observer.error(err));

            } else {

                const link = document.createElement('a');
                link.href = path;
                link.download = fileName;
                link.style.display = 'none';

                const e = document.createEvent('MouseEvents');
                e.initEvent('click', true, true);
                link.dispatchEvent(e);

                observer.next();
                observer.complete();

            }
        });

    }

    public static objectToSearchParams(obj: AnyObject): string {

        let str = "";
        for (const key in obj) {
            if (str != "") {
                str += "&";
            }
            str += key + "=" + encodeURIComponent(obj[key]);
        }

        return str;

    }

}
