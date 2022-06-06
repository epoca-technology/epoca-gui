import { TestBed } from '@angular/core/testing';

import { ClassificationTrainingEvaluationService } from './classification-training-evaluation.service';

describe('ClassificationTrainingEvaluationService', () => {
  let service: ClassificationTrainingEvaluationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassificationTrainingEvaluationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
