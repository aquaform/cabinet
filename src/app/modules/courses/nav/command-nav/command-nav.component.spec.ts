import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandNavComponent } from './command-nav.component';

describe('CommandNavComponent', () => {
  let component: CommandNavComponent;
  let fixture: ComponentFixture<CommandNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommandNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommandNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
