import { TestBed } from '@angular/core/testing';

import { ClassificationTrainingDataService } from './classification-training-data.service';

describe('ClassificationTrainingDataService', () => {
  let service: ClassificationTrainingDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassificationTrainingDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
