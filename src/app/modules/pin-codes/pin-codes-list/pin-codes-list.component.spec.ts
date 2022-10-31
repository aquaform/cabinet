import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinCodesListComponent } from './pin-codes-list.component';

describe('PinCodesListComponent', () => {
  let component: PinCodesListComponent;
  let fixture: ComponentFixture<PinCodesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinCodesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinCodesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
