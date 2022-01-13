import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceChartConfigComponent } from './price-chart-config.component';

describe('PriceChartConfigComponent', () => {
  let component: PriceChartConfigComponent;
  let fixture: ComponentFixture<PriceChartConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceChartConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceChartConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
