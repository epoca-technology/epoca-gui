import { TestBed } from '@angular/core/testing';

import { ExternalRequestService } from './external-request.service';

describe('ExternalRequestService', () => {
  let service: ExternalRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
