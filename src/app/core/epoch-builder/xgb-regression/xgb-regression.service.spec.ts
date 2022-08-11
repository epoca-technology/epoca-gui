import { TestBed } from '@angular/core/testing';

import { XgbRegressionService } from './xgb-regression.service';

describe('XgbRegressionService', () => {
  let service: XgbRegressionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XgbRegressionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
