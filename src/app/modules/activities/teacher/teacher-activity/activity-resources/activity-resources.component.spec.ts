import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityResourcesComponent } from './activity-resources.component';

describe('ActivityResourcesComponent', () => {
  let component: ActivityResourcesComponent;
  let fixture: ComponentFixture<ActivityResourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityResourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
