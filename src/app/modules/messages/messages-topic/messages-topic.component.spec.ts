import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesTopicComponent } from './messages-topic.component';

describe('MessagesTopicComponent', () => {
  let component: MessagesTopicComponent;
  let fixture: ComponentFixture<MessagesTopicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessagesTopicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
