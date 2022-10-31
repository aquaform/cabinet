import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteUploadedComponent } from './delete-uploaded.component';

describe('DeleteUploadedComponent', () => {
  let component: DeleteUploadedComponent;
  let fixture: ComponentFixture<DeleteUploadedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteUploadedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteUploadedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
