import { TestBed } from '@angular/core/testing';

import { ModelSelectionService } from './model-selection.service';

describe('ModelSelectionService', () => {
  let service: ModelSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
