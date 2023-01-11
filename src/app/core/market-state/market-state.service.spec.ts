import { TestBed } from '@angular/core/testing';

import { MarketStateService } from './market-state.service';

describe('MarketStateService', () => {
  let service: MarketStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
