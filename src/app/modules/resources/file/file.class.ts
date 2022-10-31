export class FilesTools {

    public static isAudio(url: string) {
        return this.extension(url) === 'mp3';
    }

    public static isVideo(url: string) {
        return this.extension(url) === 'mp4';
    }

    public static isPDF(url: string) {
        return this.extension(url) === 'pdf';
    }

    public static isImage(url: string) {

        const extension = this.extension(url);
        // https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types

        if (extension === 'jpg'
            || extension === 'apng'
            || extension === 'bmp'
            || extension === 'gif'
            || extension === 'jpg'
            || extension === 'jpeg'
            || extension === 'jfif'
            || extension === 'pjpeg'
            || extension === 'pjp'
            || extension === 'png'
            || extension === 'svg'
            || extension === 'webp'
        ) {
            return true;
        }

        return false;

    }

    public static extension(url: string): string {
        return url.split('.').pop().toLowerCase();
    }

    public static fileNameFromURL(url: string): string {
        return url.split('/').pop();
    }



}