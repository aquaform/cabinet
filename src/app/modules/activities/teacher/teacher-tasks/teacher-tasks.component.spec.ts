import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherTasksComponent } from './teacher-tasks.component';

describe('TeacherTasksComponent', () => {
  let component: TeacherTasksComponent;
  let fixture: ComponentFixture<TeacherTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
