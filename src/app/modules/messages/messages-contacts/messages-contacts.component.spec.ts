import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesContactsComponent } from './messages-contacts.component';

describe('MessagesContactsComponent', () => {
  let component: MessagesContactsComponent;
  let fixture: ComponentFixture<MessagesContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessagesContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
