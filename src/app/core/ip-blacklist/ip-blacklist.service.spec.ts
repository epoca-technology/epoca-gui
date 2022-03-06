import { TestBed } from '@angular/core/testing';

import { IpBlacklistService } from './ip-blacklist.service';

describe('IpBlacklistService', () => {
  let service: IpBlacklistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpBlacklistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
