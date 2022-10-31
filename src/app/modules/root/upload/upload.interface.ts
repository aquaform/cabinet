import { ArrayElementAPI } from '@modules/root/api/api.converter';

export class UploadedFile {
    name: string;
    ref: string;
    extension: string;
}

@ArrayElementAPI(UploadedFile)
export class UploadFileResponse extends Array<UploadedFile> {

}

export class DeleteUploadedFileResponse {
    operationComplete: boolean;
}

export class AfterSelectFileData {
    file: File;
}

export class FileToUpload {
    description: File;
    base64Data: string;
}
