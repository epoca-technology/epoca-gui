import { TestBed } from '@angular/core/testing';

import { KerasClassificationService } from './keras-classification.service';

describe('KerasClassificationService', () => {
  let service: KerasClassificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KerasClassificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
