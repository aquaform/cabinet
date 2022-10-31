import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityDescriptionComponent } from './activity-description.component';

describe('ActivityDescriptionComponent', () => {
  let component: ActivityDescriptionComponent;
  let fixture: ComponentFixture<ActivityDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
