import { TestBed } from '@angular/core/testing';

import { RegressionTrainingEvaluationService } from './regression-training-evaluation.service';

describe('RegressionTrainingEvaluationService', () => {
  let service: RegressionTrainingEvaluationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegressionTrainingEvaluationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
