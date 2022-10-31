import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityStudentsComponent } from './activity-students.component';

describe('ActivityStudentsComponent', () => {
  let component: ActivityStudentsComponent;
  let fixture: ComponentFixture<ActivityStudentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityStudentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
