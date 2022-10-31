import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityPollComponent } from './activity-poll.component';

describe('ActivityPollComponent', () => {
  let component: ActivityPollComponent;
  let fixture: ComponentFixture<ActivityPollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityPollComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityPollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
