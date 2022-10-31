import { Injectable } from '@angular/core';
import { Observable, of, zip } from 'rxjs';
import {
  LibraryTreeElement,
  LibraryTreeResponse,
  LibraryTreeResElementArray,
  LibraryTreeTagElementArray,
  ElectronicResourceDataResponse,
  LibraryTreeResElement
} from './library.interface';
import { ApiService } from '@modules/root/api/api.service';
import { AuthService } from '@modules/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { concatMap, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { authPermissionNames } from '@modules/auth/auth.interface';
import { APIServiceNames } from '@modules/root/api/api.interface';
import { resourceTypes } from '@modules/resources/resources.interface';
import { SettingsService } from '@modules/root/settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  private allElements: LibraryTreeElement[] = null;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private translate: TranslateService,
    private settings: SettingsService
  ) {

  }

  AllElements(): Observable<LibraryTreeElement[]> {

    if (this.allElements) {
      return of(this.allElements);
    }

    const electronicResourcesData$ = this.translate.get("LIBRARY.RES_CATALOG")
      .pipe(concatMap((val) => this.electronicResourcesData$(val)));

    const libraryData$ = this.translate.get("LIBRARY.MY_LIBRARY")
      .pipe(concatMap((val) => this.libraryData$(val)));

    return zip(libraryData$, electronicResourcesData$).pipe(map((response) => {
      if (!response) {
        return [];
      }
      if (environment.displayLog) {
        console.log("Library response:", response);
      }
      this.allElements = response[0].concat(response[1]);
      if (this.settings.Activities().hideEmptyLibraryElements) {
        this.deleteEmptyFolders();
      }
      this.deleteOnceRootTreeElement();
      if (environment.displayLog) {
        console.log("Library elements:", this.allElements);
      }
      return this.allElements;
    }));

  }

  // Удаляет первую папку, если она одна
  //
  private deleteOnceRootTreeElement(): void {
    const allRootElements = this.allElements.filter((val) => !val.parent);
    const idRootElement: string = (allRootElements.length === 1) ? allRootElements[0].id : "";
    if (!idRootElement) {
      return;
    }
    // Делаем все подчиненные элементы корневыми
    this.allElements.forEach((val) => {
      if (val.parent === idRootElement) {
        val.parent = "";
      }
    });
    // Удаляем корневой элемент
    this.allElements = this.allElements.filter((val) => val.id !== idRootElement);
  }

  // Удаляет пустые папки
  private deleteEmptyFolders(): void {
    this.allElements = this.allElements.filter((folder) => {
      if (!folder.isFolder) {
        return true;
      }
      if (!this.folderIsEmpty(folder)) {
        return true;
      }
      return false;
    });
  }

  private folderIsEmpty(folder: LibraryTreeElement): boolean {
    const allChildren = this.allElements.filter(val => val.parent === folder.id && val.id !== folder.id);
    for (const children of allChildren) {
      if (!children.isFolder) {
        return false;
      }
      if (!this.folderIsEmpty(children)) {
        return false;
      }
    }
    return true;
  }

  // Получает данные библиотеки
  //
  private libraryData$(MY_LIBRARY_TITLE: string): Observable<LibraryTreeElement[]> {
    if (this.auth.IsPermission(authPermissionNames.library)) {
      return this.api.Get<LibraryTreeResponse>(
        "userLibrary/get",
        {},
        APIServiceNames.edu,
        this.auth.SearchParams(),
        LibraryTreeResponse
      ).pipe(map((data) => {

        if (environment.displayLog) {
          console.log("Library raw data:", data);
        }

        // Преобразует ресурсы библиотеки в элементы дерева
        const resourcesToElement = (resources: LibraryTreeResElementArray, parentID: string): LibraryTreeElement[] => {
          if (!resources) {
            return [];
          }
          const treeElements: LibraryTreeElement[] = [];
          for (const val of resources) {
            const treeElement: LibraryTreeElement = {
              id: val.resource,
              name: val.name,
              isFolder: false,
              res: val,
              parent: parentID
            };
            treeElements.push(treeElement);
          }
          return treeElements;
        };

        // Преобразует теги в папки
        const tagsToFolders = (tags: LibraryTreeTagElementArray, parentID: string): LibraryTreeElement[] => {
          if (!tags) {
            return [];
          }
          let treeElements: LibraryTreeElement[] = [];

          for (const val of tags) {
            if (val.link) {
              const treeElement: LibraryTreeElement = {
                id: val.link,
                name: val.name,
                isFolder: true,
                res: null,
                parent: parentID
              };
              treeElements.push(treeElement);
              treeElements = treeElements.concat(tagsToFolders(val.childElements, val.link));
              treeElements = treeElements.concat(resourcesToElement(val.resources, val.link));
            } else {
              // Бывают случаи, когда тег не имеет идентификатора. В этом случае не добавляем
              // его в общий список, а все вложенные в него элементы добавляем к родителю.
              treeElements = treeElements.concat(tagsToFolders(val.childElements, parentID));
              treeElements = treeElements.concat(resourcesToElement(val.resources, parentID));
            }

          }

          return treeElements;

        };

        // Преобразует библиотеки в папки
        const librariesToFolders = (libraries: LibraryTreeResponse): LibraryTreeElement[] => {

          if (!libraries) {
            return [];
          }

          let treeElements: LibraryTreeElement[] = [];

          for (const val of libraries) {
            const treeElement: LibraryTreeElement = {
              id: val.id,
              name: val.name,
              isFolder: true,
              res: null,
              parent: ""
            };
            if (treeElement.id === this.auth.getUserDescription().id) {
              treeElement.name = MY_LIBRARY_TITLE;
            }
            treeElements.push(treeElement);
            treeElements = treeElements.concat(tagsToFolders(val.tags, val.id));
            treeElements = treeElements.concat(resourcesToElement(val.resources, val.id));
          }

          return treeElements;

        };

        return librariesToFolders(data);

      }));
    }
    return of([]);
  }

  // Получает данные каталога электронных ресурсов
  //
  private electronicResourcesData$(RES_CATALOG_TITLE: string): Observable<LibraryTreeElement[]> {
    if (this.auth.IsPermission(authPermissionNames.electronicResources)) {
      return this.api.Get<ElectronicResourceDataResponse>(
        "catalog/get",
        {},
        APIServiceNames.res,
        this.auth.SearchParams(),
        ElectronicResourceDataResponse
      ).pipe(map((data) => {

        if (environment.displayLog) {
          console.log("Electronic resources raw data:", data);
        }

        let tree: LibraryTreeElement[] = [];
        if (!data) {
          return tree;
        }

        const rootFolderID = "rootElectronicResources";
        const rootFolder: LibraryTreeElement = {
          id: rootFolderID,
          name: RES_CATALOG_TITLE,
          isFolder: true,
          res: null,
          parent: ""
        };
        tree.push(rootFolder);

        tree = tree.concat(data.map((val) => {
          const res: LibraryTreeResElement = (val.isFolder) ? null : {
            name: val.name,
            fragment: "",
            resource: val.link,
            addDate: val.modifiedDate.getTime(),
            type: resourceTypes.res,
            extension: ""
          };
          const treeElement: LibraryTreeElement = {
            id: val.link,
            name: val.name,
            isFolder: val.isFolder,
            res: res,
            parent: (val.parent) ? val.parent : rootFolderID
          };
          return treeElement;
        }));

        return tree;

      }));
    }
    return of([]);
  }

}
