import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityPollResultsComponent } from './activity-poll-results.component';

describe('ActivityPollResultsComponent', () => {
  let component: ActivityPollResultsComponent;
  let fixture: ComponentFixture<ActivityPollResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityPollResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityPollResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
