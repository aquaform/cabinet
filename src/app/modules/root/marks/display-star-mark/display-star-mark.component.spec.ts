import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayStarMarkComponent } from './display-star-mark.component';

describe('DisplayStarMarkComponent', () => {
  let component: DisplayStarMarkComponent;
  let fixture: ComponentFixture<DisplayStarMarkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayStarMarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayStarMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
