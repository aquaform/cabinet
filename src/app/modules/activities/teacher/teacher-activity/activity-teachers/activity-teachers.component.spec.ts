import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityTeachersComponent } from './activity-teachers.component';

describe('ActivityTeachersComponent', () => {
  let component: ActivityTeachersComponent;
  let fixture: ComponentFixture<ActivityTeachersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityTeachersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityTeachersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
