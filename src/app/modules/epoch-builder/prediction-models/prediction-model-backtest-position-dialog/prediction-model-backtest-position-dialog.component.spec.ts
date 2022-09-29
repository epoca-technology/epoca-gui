import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionModelBacktestPositionDialogComponent } from './prediction-model-backtest-position-dialog.component';

describe('PredictionModelBacktestPositionDialogComponent', () => {
  let component: PredictionModelBacktestPositionDialogComponent;
  let fixture: ComponentFixture<PredictionModelBacktestPositionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredictionModelBacktestPositionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionModelBacktestPositionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
