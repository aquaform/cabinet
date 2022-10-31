import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderListElementComponent } from './folder-list-element.component';

describe('FolderListElementComponent', () => {
  let component: FolderListElementComponent;
  let fixture: ComponentFixture<FolderListElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderListElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderListElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
