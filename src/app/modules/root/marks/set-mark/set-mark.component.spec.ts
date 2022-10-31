import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetMarkComponent } from './set-mark.component';

describe('SetMarkComponent', () => {
  let component: SetMarkComponent;
  let fixture: ComponentFixture<SetMarkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetMarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
