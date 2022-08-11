import { TestBed } from '@angular/core/testing';

import { EpochBuilderMetadataService } from './epoch-builder-metadata.service';

describe('EpochBuilderMetadataService', () => {
  let service: EpochBuilderMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpochBuilderMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
