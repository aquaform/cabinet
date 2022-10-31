import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityTasksComponent } from './activity-tasks.component';

describe('ActivityTasksComponent', () => {
  let component: ActivityTasksComponent;
  let fixture: ComponentFixture<ActivityTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
