import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentOptionalActivitiesComponent } from './student-optional-activities.component';

describe('StudentOptionalActivitiesComponent', () => {
  let component: StudentOptionalActivitiesComponent;
  let fixture: ComponentFixture<StudentOptionalActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentOptionalActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentOptionalActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
