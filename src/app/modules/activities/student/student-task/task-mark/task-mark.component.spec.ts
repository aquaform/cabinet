import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskMarkComponent } from './task-mark.component';

describe('TaskMarkComponent', () => {
  let component: TaskMarkComponent;
  let fixture: ComponentFixture<TaskMarkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskMarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
