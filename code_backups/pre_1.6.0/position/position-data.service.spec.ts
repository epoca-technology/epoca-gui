import { TestBed } from '@angular/core/testing';

import { PositionDataService } from './position-data.service';

describe('PositionDataService', () => {
  let service: PositionDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PositionDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
