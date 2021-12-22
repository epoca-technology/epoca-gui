import { TestBed } from '@angular/core/testing';

import { CandlestickChartService } from './candlestick-chart.service';

describe('CandlestickChartService', () => {
  let service: CandlestickChartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CandlestickChartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
