import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterStartComponent } from './register-start.component';

describe('RegisterStartComponent', () => {
  let component: RegisterStartComponent;
  let fixture: ComponentFixture<RegisterStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterStartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
