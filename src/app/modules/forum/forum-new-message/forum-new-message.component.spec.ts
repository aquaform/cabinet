import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumNewMessageComponent } from './forum-new-message.component';

describe('ForumNewMessageComponent', () => {
  let component: ForumNewMessageComponent;
  let fixture: ComponentFixture<ForumNewMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForumNewMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumNewMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
