import { TestBed } from '@angular/core/testing';

import { BulkDataService } from './bulk-data.service';

describe('BulkDataService', () => {
  let service: BulkDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BulkDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
