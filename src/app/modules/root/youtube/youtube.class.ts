import { BROWSER } from '@modules/courses/tools/universal/browser';

export class YoutubeTools {

    static getVideoID(url: string): string {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : "";
    }

    static isValid(url: string): boolean {
        return !!YoutubeTools.getVideoID(url);
    }

    static videoURL(videoID: string, autoplay: boolean): string {
        let params = "?color=white&controls=1&iv_load_policy=3&rel=0&showinfo=0&autoplay=" + String(autoplay);
        if (BROWSER.oldIE() || BROWSER.oldWebkit()) {
            params += "&fs=0";
        }
        return "https://www.youtube.com/embed/" + videoID + params;
    }

}