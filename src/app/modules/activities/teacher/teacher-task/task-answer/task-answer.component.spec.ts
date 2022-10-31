import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAnswerComponent } from './task-answer.component';

describe('TaskAnswerComponent', () => {
  let component: TaskAnswerComponent;
  let fixture: ComponentFixture<TaskAnswerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskAnswerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
