import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradingSimulationsComponent } from './trading-simulations.component';

describe('TradingSimulationsComponent', () => {
  let component: TradingSimulationsComponent;
  let fixture: ComponentFixture<TradingSimulationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradingSimulationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradingSimulationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
