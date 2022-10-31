import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InnerHTMLComponent } from './inner-html.component';

describe('InnerHTMLComponent', () => {
  let component: InnerHTMLComponent;
  let fixture: ComponentFixture<InnerHTMLComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InnerHTMLComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InnerHTMLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
