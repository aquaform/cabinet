import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinCodesBlockComponent } from './pin-codes-block.component';

describe('PinCodesBlockComponent', () => {
  let component: PinCodesBlockComponent;
  let fixture: ComponentFixture<PinCodesBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinCodesBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinCodesBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
