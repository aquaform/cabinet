import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryNewComponent } from './library-new.component';

describe('LibraryNewComponent', () => {
  let component: LibraryNewComponent;
  let fixture: ComponentFixture<LibraryNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
