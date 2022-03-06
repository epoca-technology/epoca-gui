import { TestBed } from '@angular/core/testing';

import { DatabaseManagementService } from './database-management.service';

describe('DatabaseManagementService', () => {
  let service: DatabaseManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabaseManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
