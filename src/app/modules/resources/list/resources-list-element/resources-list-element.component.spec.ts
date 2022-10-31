import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcesListElementComponent } from './resources-list-element.component';

describe('ResourcesListElementComponent', () => {
  let component: ResourcesListElementComponent;
  let fixture: ComponentFixture<ResourcesListElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourcesListElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourcesListElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
