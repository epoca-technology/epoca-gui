import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipDialogComponent } from './tooltip-dialog.component';

describe('TooltipDialogComponent', () => {
  let component: TooltipDialogComponent;
  let fixture: ComponentFixture<TooltipDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TooltipDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
