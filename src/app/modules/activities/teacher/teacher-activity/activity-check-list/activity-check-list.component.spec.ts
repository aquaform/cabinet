import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCheckListComponent } from './activity-check-list.component';

describe('ActivityCheckListComponent', () => {
  let component: ActivityCheckListComponent;
  let fixture: ComponentFixture<ActivityCheckListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCheckListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCheckListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
