import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpochPredictionCandlestickDialogComponent } from './epoch-prediction-candlestick-dialog.component';

describe('EpochPredictionCandlestickDialogComponent', () => {
  let component: EpochPredictionCandlestickDialogComponent;
  let fixture: ComponentFixture<EpochPredictionCandlestickDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpochPredictionCandlestickDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpochPredictionCandlestickDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
