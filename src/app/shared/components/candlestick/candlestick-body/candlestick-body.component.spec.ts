import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandlestickBodyComponent } from './candlestick-body.component';

describe('CandlestickBodyComponent', () => {
  let component: CandlestickBodyComponent;
  let fixture: ComponentFixture<CandlestickBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandlestickBodyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandlestickBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
