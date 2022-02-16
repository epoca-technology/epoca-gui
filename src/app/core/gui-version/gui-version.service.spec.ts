import { TestBed } from '@angular/core/testing';

import { GuiVersionService } from './gui-version.service';

describe('GuiVersionService', () => {
  let service: GuiVersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuiVersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
