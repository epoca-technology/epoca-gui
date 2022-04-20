import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionBacktestingComponent } from './prediction-backtesting.component';

describe('PredictionBacktestingComponent', () => {
  let component: PredictionBacktestingComponent;
  let fixture: ComponentFixture<PredictionBacktestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredictionBacktestingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionBacktestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
