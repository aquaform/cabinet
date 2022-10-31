import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { FileService } from '@modules/resources/file/file.service';
import { ResService } from '@modules/resources/res/res.service';
import { BookService } from '@modules/resources/book/book.service';
import { ResourceType, resourceTypes } from '../../resources.interface';
import { BookData } from '@modules/resources/book/book.interface';
import { ModalService } from '@modules/root/modal/modal.service';
import { FileComponentInputData } from '@modules/resources/file/file.interface';
import { modalComponentNames } from '@modules/root/modal/modal.interface';

@Component({
  selector: 'app-resources-list-element',
  templateUrl: './resources-list-element.component.html',
  styleUrls: ['./resources-list-element.component.scss']
})
export class ResourcesListElementComponent implements OnInit {

  @Input() id: string;
  @Input() name: string;
  @Input() ownerID: string;
  @Input() ownerName: string;
  @Input() resourceType: ResourceType;
  @Input() date: Date;
  @Input() providingEducation: string;
  @Input() extension: string;
  @Input() displayExtension: boolean;
  @Input() displayDeleteButton: boolean;
  @Input() disableModification: boolean;
  @Input() displayDownloadButton: boolean;

  // Recording only:
  @Input() isHTML: boolean;
  @Input() isVideo: boolean;
  @Input() webAddress: string;

  @Output() afterDelete = new EventEmitter<any>();
  @Output() loading = new EventEmitter<boolean>();

  isLoading = false;

  constructor(
    private file: FileService,
    private err: ErrorsService,
    private res: ResService,
    private book: BookService,
    private modal: ModalService
  ) { }

  ngOnInit() {
  }

  allowDownloadButton(): boolean {
    if (this.resourceType === resourceTypes.file && this.displayDownloadButton) {
      return true;
    }
    return false;
  }

  openElement() {
    switch (this.resourceType) {
      case resourceTypes.file:
        return this.openFile(false);
      case resourceTypes.res:
        return this.openElectronicResource();
      case resourceTypes.book:
        return this.openBook();
      case resourceTypes.recording:
        return this.openRecording();
    }
  }

  downloadFile() {
    this.openFile(true);
  }

  openRecording() {
    const data: FileComponentInputData = {
      path: this.webAddress,
      name: this.name,
      isAudio: false,
      isImage: false,
      isPDF: false,
      isVideo: this.isVideo,
      isHTML: this.isHTML
    };

    this.modal.Display({
      component: modalComponentNames.file,
      data: data,
      maximizeSize: true
    });

  }

  openFile(onlyDownload: boolean) {

    this.setLoading(true);

    this.file.Open(this.id, this.name, this.ownerName, this.ownerID, onlyDownload).subscribe({
      error: (err) => this.err.register(err),
      complete: () => this.setLoading(false)
    });

    return false;

  }

  openBook() {
    const bookData: BookData = {
      id: this.id,
      name: this.name
    };
    this.book.Open(bookData);
    return false;
  }

  openElectronicResource() {

    this.setLoading(true);

    this.res.Open({
      electronicResource: this.id,
      providingEducation: this.providingEducation
    }).subscribe({
      error: (err) => {
        this.err.register(err, false, true);
        this.setLoading(false);
      },
    });

    return false;

  }

  setLoading(value: boolean) {
    this.isLoading = value;
  }

  emitLoading(value: boolean) {
    this.loading.emit(value);
  }

  emitAfterDelete(event: any) {
    this.afterDelete.emit(event);
  }

  icon(): string {
    if (this.resourceType === resourceTypes.book) {
      return "book";
    }
    if (this.resourceType === resourceTypes.res) {
      return "book";
    }
    if (this.resourceType === resourceTypes.recording) {
      return "video";
    }
    return this.file.Icon(this.extension);
  }

}
