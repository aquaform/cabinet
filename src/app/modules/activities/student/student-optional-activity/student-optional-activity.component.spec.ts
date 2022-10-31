import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentOptionalActivityComponent } from './student-optional-activity.component';

describe('StudentOptionalActivityComponent', () => {
  let component: StudentOptionalActivityComponent;
  let fixture: ComponentFixture<StudentOptionalActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentOptionalActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentOptionalActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
