import { TestBed } from '@angular/core/testing';

import { EpochBuilderViewService } from './epoch-builder-view.service';

describe('EpochBuilderViewService', () => {
  let service: EpochBuilderViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpochBuilderViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
