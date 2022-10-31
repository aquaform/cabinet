import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityUserFilesComponent } from './activity-user-files.component';

describe('ActivityUserFilesComponent', () => {
  let component: ActivityUserFilesComponent;
  let fixture: ComponentFixture<ActivityUserFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityUserFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityUserFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
