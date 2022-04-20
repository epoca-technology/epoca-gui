import { TestBed } from '@angular/core/testing';

import { PredictionBacktestingService } from './prediction-backtesting.service';

describe('PredictionBacktestingService', () => {
  let service: PredictionBacktestingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PredictionBacktestingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
