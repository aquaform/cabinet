import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherActivityComponent } from './teacher-activity.component';

describe('TeacherActivityComponent', () => {
  let component: TeacherActivityComponent;
  let fixture: ComponentFixture<TeacherActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TeacherActivityComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
