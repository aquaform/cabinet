import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsFromBackendComponent } from './reports-from-backend.component';

describe('ReportsFromBackendComponent', () => {
  let component: ReportsFromBackendComponent;
  let fixture: ComponentFixture<ReportsFromBackendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportsFromBackendComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsFromBackendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
