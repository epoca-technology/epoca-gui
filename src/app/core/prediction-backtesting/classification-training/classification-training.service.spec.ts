import { TestBed } from '@angular/core/testing';

import { ClassificationTrainingService } from './classification-training.service';

describe('ClassificationTrainingService', () => {
  let service: ClassificationTrainingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassificationTrainingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
