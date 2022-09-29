import { TestBed } from '@angular/core/testing';

import { PredictionModelService } from './prediction-model.service';

describe('PredictionModelService', () => {
  let service: PredictionModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PredictionModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
