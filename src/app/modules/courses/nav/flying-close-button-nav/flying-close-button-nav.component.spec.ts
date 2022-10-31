import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlyingCloseButtonNavComponent } from './flying-close-button-nav.component';

describe('FlyingCloseButtonNavComponent', () => {
  let component: FlyingCloseButtonNavComponent;
  let fixture: ComponentFixture<FlyingCloseButtonNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlyingCloseButtonNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlyingCloseButtonNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
