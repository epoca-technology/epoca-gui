import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiVersionComponent } from './gui-version.component';

describe('GuiVersionComponent', () => {
  let component: GuiVersionComponent;
  let fixture: ComponentFixture<GuiVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuiVersionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GuiVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
