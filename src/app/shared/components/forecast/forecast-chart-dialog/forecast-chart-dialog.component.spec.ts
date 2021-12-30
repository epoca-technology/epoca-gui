import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastChartDialogComponent } from './forecast-chart-dialog.component';

describe('ForecastChartDialogComponent', () => {
  let component: ForecastChartDialogComponent;
  let fixture: ComponentFixture<ForecastChartDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForecastChartDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastChartDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
