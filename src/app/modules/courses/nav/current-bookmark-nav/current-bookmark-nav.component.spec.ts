import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentBookmarkNavComponent } from './current-bookmark-nav.component';

describe('CurrentBookmarkNavComponent', () => {
  let component: CurrentBookmarkNavComponent;
  let fixture: ComponentFixture<CurrentBookmarkNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentBookmarkNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentBookmarkNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
