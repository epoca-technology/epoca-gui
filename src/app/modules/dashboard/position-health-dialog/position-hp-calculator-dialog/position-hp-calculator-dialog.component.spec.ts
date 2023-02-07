import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionHpCalculatorDialogComponent } from './position-hp-calculator-dialog.component';

describe('PositionHpCalculatorDialogComponent', () => {
  let component: PositionHpCalculatorDialogComponent;
  let fixture: ComponentFixture<PositionHpCalculatorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionHpCalculatorDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionHpCalculatorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
