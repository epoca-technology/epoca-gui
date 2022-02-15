import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradingSessionComponent } from './trading-session.component';

describe('TradingSessionComponent', () => {
  let component: TradingSessionComponent;
  let fixture: ComponentFixture<TradingSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradingSessionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradingSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
