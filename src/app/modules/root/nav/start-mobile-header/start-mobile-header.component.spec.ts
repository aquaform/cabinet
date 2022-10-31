import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartMobileHeaderComponent } from './start-mobile-header.component';

describe('StartMobileHeaderComponent', () => {
  let component: StartMobileHeaderComponent;
  let fixture: ComponentFixture<StartMobileHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartMobileHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartMobileHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
