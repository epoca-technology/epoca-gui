import { TestBed } from '@angular/core/testing';

import { OrderBookService } from './order-book.service';

describe('OrderBookService', () => {
  let service: OrderBookService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderBookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
