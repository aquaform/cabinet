import { BROWSER } from "./browser";
import { APIProvider } from "../../learning/api/api.provider";
import { StandardProcessingInterface } from "./processing";

export class FILE {

    // Скачивает файл
    //
    public static download(sUrl: string, api: APIProvider) {

        let standardProcessing: StandardProcessingInterface = {
            standard: true
        };

        api.downloadFile(sUrl, standardProcessing);

        if (!standardProcessing.standard) {
            return; // Ссылку обработает API
        }

        if (!BROWSER.oldIE()) {
            let hiddenIFrameID = 'hiddenDownloaderFrame';
            let iframe: HTMLIFrameElement = document.getElementById(hiddenIFrameID) as HTMLIFrameElement;
            if (iframe === null) {
                iframe = document.createElement('iframe');
                iframe.id = hiddenIFrameID;
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }
            iframe.src = sUrl;
            return;
        }

        // Force file download (whether supported by server).
        if (sUrl.indexOf('?') === -1) {
            sUrl += '?download';
        }

        window.open(sUrl, '_blank');

        return;

    }

}