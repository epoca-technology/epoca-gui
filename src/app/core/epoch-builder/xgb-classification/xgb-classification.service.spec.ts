import { TestBed } from '@angular/core/testing';

import { XgbClassificationService } from './xgb-classification.service';

describe('XgbClassificationService', () => {
  let service: XgbClassificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XgbClassificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
