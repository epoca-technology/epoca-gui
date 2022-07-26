import { TestBed } from '@angular/core/testing';

import { RegressionSelectionService } from './regression-selection.service';

describe('RegressionSelectionService', () => {
  let service: RegressionSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegressionSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
