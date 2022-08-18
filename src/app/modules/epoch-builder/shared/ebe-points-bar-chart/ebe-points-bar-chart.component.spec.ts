import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EbePointsBarChartComponent } from './ebe-points-bar-chart.component';

describe('EbePointsBarChartComponent', () => {
  let component: EbePointsBarChartComponent;
  let fixture: ComponentFixture<EbePointsBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EbePointsBarChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EbePointsBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
