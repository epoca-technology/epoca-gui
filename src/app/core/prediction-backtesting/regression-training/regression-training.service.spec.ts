import { TestBed } from '@angular/core/testing';

import { RegressionTrainingService } from './regression-training.service';

describe('RegressionTrainingService', () => {
  let service: RegressionTrainingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegressionTrainingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
