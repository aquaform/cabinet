import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ErrorsService } from '@modules/root/errors/errors.service';
import { AppComponentTemplate } from '@shared/component.template';
import {
  LibraryTreeElement,
  BreadcrumbsElements
} from '../library.interface';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LibraryService } from '../library.service';

@Component({
  selector: 'app-library-tree',
  templateUrl: './library-tree.component.html',
  styleUrls: ['./library-tree.component.scss']
})
export class LibraryTreeComponent extends AppComponentTemplate {

  private _currentFolder = "";

  @Input()
  set currentFolder(val: string) {
    this._currentFolder = val;
    this.getCurrentElements();
  }

  get currentFolder(): string {
    return this._currentFolder;
  }

  @Output() emitBreadcrumbs = new EventEmitter<BreadcrumbsElements>();
  @Output() emitIsLoading = new EventEmitter<boolean>();
  @Output() emitAllElements = new EventEmitter<LibraryTreeElement[]>();

  isLoading = false;

  allElements: LibraryTreeElement[] = [];
  currentElements: LibraryTreeElement[] = [];
  currentFolders: LibraryTreeElement[] = [];
  currentResources: LibraryTreeElement[] = [];

  constructor(
    private err: ErrorsService,
    private router: Router,
    private library: LibraryService
  ) {
    super();
  }

  ngOnInit() {
    this.setIsLoading(true);
    this.library.AllElements()
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (response) => {

        if (!response) {
          return;
        }

        this.allElements = response;
        this.getCurrentElements();
        this.emitAllElements.emit(this.allElements);

      },
      (err) => this.err.register(err),
      () => this.setIsLoading(false)
    );
  }

  // Получает элементы открытой папки
  //
  getCurrentElements() {
    this.currentElements = this.allElements.filter(val => val.parent === this.currentFolder);
    this.currentFolders = this.currentElements.filter(val => val.isFolder);
    this.currentResources = this.currentElements.filter(val => !val.isFolder);
  }

  setIsLoading(value: boolean) {
    this.isLoading = value;
    this.emitIsLoading.emit(this.isLoading);
  }

  openFolder(folderID: string) {
    this.router.navigate(['/library', 'folder', folderID]);
  }

}
