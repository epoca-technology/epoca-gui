import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandlestickChartConfigComponent } from './candlestick-chart-config.component';

describe('CandlestickChartConfigComponent', () => {
  let component: CandlestickChartConfigComponent;
  let fixture: ComponentFixture<CandlestickChartConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandlestickChartConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandlestickChartConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
