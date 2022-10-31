import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StartPageDataToPrimaryBlock, NavBarElement } from './nav.interface';

@Injectable({
  providedIn: 'root'
})
export class NavService {

  private _primaryBlockData$ = new BehaviorSubject<StartPageDataToPrimaryBlock>(null);
  PrimaryBlockData$ = this._primaryBlockData$.asObservable();

  private _moreNavElements$ = new BehaviorSubject<NavBarElement[]>([]);
  MoreNavElements$ = this._moreNavElements$.asObservable();


  constructor() { }

  UpdatePrimaryBlockData(data: StartPageDataToPrimaryBlock) {
    this._primaryBlockData$.next(data);
  }

  UpdateMoreNavElementsData(data: NavBarElement[]) {
    this._moreNavElements$.next(data);
  }

}
