import { TestBed } from '@angular/core/testing';

import { EpochService } from './epoch.service';

describe('EpochService', () => {
  let service: EpochService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpochService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
