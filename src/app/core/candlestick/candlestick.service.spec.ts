import { TestBed } from '@angular/core/testing';

import { CandlestickService } from './candlestick.service';

describe('CandlestickService', () => {
  let service: CandlestickService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CandlestickService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
