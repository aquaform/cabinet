import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultEncapsulationComponent } from './default-encapsulation.component';

describe('DefaultEncapsulationComponent', () => {
  let component: DefaultEncapsulationComponent;
  let fixture: ComponentFixture<DefaultEncapsulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultEncapsulationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultEncapsulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
