import { Component, HostBinding, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '@modules/root/i18n/i18n.class';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AppComponentTemplate } from '@shared/component.template';
import { BreadcrumbsElements, LibraryTreeElement } from '@modules/library/library.interface';
import { Observable } from 'rxjs';
import { LibraryService } from '@modules/library/library.service';
import { ErrorsService } from '@modules/root/errors/errors.service';

export type LibraryBlockName = "tree" | "new";

export const libraryBlockNames = {
  tree: "tree" as LibraryBlockName,
  new: "new" as LibraryBlockName,
};

interface PageDescription {
  name: () => Observable<string>;
  block: LibraryBlockName;
  available: boolean;
}

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent extends AppComponentTemplate {

  @HostBinding('class.page-host') isPage = true;

  blockNames = libraryBlockNames;

  @ViewChild('onlyMobileElement', { static: true }) onlyMobileElement: ElementRef;

  allPages: PageDescription[] = [
    {
      name: () => this.translate.get('LIBRARY.TITLE'),
      block: libraryBlockNames.tree,
      available: true
    },
    {
      name: () => this.translate.get('LIBRARY.NEW_TITLE'),
      block: libraryBlockNames.new,
      available: true
    },
  ];

  get availablePages(): PageDescription[] {
    return this.allPages.filter(val => val.available);
  }

  currentBlock: LibraryBlockName = this.availablePages[0].block;

  currentFolder = "";
  breadcrumbsElements: BreadcrumbsElements = {
    current: null,
    previous: null,
    opened: []
  };
  allElements: LibraryTreeElement[] = [];
  isLoading = false;

  @HostListener('window:resize', ['$event'])
  onWindowResize($event) {
    // Позволяет перезагрузить компонент при изменении размера окна
  }

  constructor(
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private library: LibraryService,
    private err: ErrorsService,
    private cd: ChangeDetectorRef) {

    super();
    Language.init(this.translate);

  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
        this.currentBlock = (params.block) ? params.block : this.availablePages[0].block;
        this.currentFolder = (params.folder) ? params.folder : "";
        this.breadcrumbsElements = this.getBreadcrumbsElements();
        this.cd.detectChanges(); // Обязательно
        if (this.currentBlock !== this.blockNames.tree) {
          this.library.AllElements().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
            (response) => this.setAllElements(response),
            (err) => this.err.register(err)
          );
        }
      });
  }

  setAllElements(allElements: LibraryTreeElement[]) {
    this.allElements = allElements;
    this.breadcrumbsElements = this.getBreadcrumbsElements();
  }

  setIsLoading(value: boolean) {
    this.isLoading = value;
  }

  getBreadcrumbsElements(): BreadcrumbsElements {
    const breadcrumbsElements: BreadcrumbsElements = {
      current: null,
      previous: null,
      opened: []
    };
    if (!this.currentFolder) {
      return breadcrumbsElements;
    }
    breadcrumbsElements.current = this.allElements.find(val => val.id === this.currentFolder);
    const addFolderRecursively = (currentFolder: string) => {
      if (!currentFolder) {
        return;
      }
      const currentFolderElement = this.allElements.find(val => val.id === currentFolder);
      if (currentFolderElement) {
        breadcrumbsElements.opened.push(currentFolderElement);
        addFolderRecursively(currentFolderElement.parent);
      }
    };
    if (breadcrumbsElements.current) {
      addFolderRecursively(breadcrumbsElements.current.parent);
    }
    breadcrumbsElements.opened.reverse();
    if (breadcrumbsElements.opened.length > 0) {
      breadcrumbsElements.previous = breadcrumbsElements.opened[breadcrumbsElements.opened.length - 1];
    }
    return breadcrumbsElements;
  }

  isMobile(): boolean {
    if (!this.onlyMobileElement) {
      return false;
    }
    return !(this.onlyMobileElement.nativeElement.offsetParent === null);
    // https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  }

  isBlockAvailable(blockName: LibraryBlockName): boolean {
    if (this.isMobile() && this.availablePages.findIndex(val => val.block === blockName) > -1) {
      return blockName === this.currentBlock;
    } else {
      return this.allPages.find(val => val.block === blockName).available;
    }
  }

  goToPage(page: PageDescription) {
    this.router.navigate(['/library', page.block]);
  }

  goToBack() {
    if (this.breadcrumbsElements.previous) {
      this.router.navigate(['/library', 'folder', this.breadcrumbsElements.previous.id]);
    } else {
      this.router.navigate(['/library']);
    }
  }

}
