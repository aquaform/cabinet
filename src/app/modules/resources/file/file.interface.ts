
export class FileComponentInputData {
    path: string;
    name: string;
    isAudio: boolean;
    isImage: boolean;
    isPDF: boolean;
    isVideo: boolean;
    isHTML: boolean;
}

export class GetFileURLRequest {
    baseDesktop: string;
    baseFiles: string;
}

export class GetFileURLResponse extends String {

}

export class GetFileNameResponse extends String {
}
