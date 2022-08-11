import { TestBed } from '@angular/core/testing';

import { KerasRegressionService } from './keras-regression.service';

describe('KerasRegressionService', () => {
  let service: KerasRegressionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KerasRegressionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
