import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPinComponent } from './register-pin.component';

describe('RegisterPinComponent', () => {
  let component: RegisterPinComponent;
  let fixture: ComponentFixture<RegisterPinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterPinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
