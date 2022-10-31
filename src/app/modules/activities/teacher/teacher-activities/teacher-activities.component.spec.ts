import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherActivitiesComponent } from './teacher-activities.component';

describe('TeacherActivitiesComponent', () => {
  let component: TeacherActivitiesComponent;
  let fixture: ComponentFixture<TeacherActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
