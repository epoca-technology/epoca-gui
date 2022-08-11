import { TestBed } from '@angular/core/testing';

import { EpochBuilderEvaluationService } from './epoch-builder-evaluation.service';

describe('EpochBuilderEvaluationService', () => {
  let service: EpochBuilderEvaluationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpochBuilderEvaluationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
