import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KerasTrainingEpochsBarChartComponent } from './keras-training-epochs-bar-chart.component';

describe('KerasTrainingEpochsBarChartComponent', () => {
  let component: KerasTrainingEpochsBarChartComponent;
  let fixture: ComponentFixture<KerasTrainingEpochsBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KerasTrainingEpochsBarChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KerasTrainingEpochsBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
