import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradingSessionsComponent } from './trading-sessions.component';

describe('TradingSessionComponent', () => {
  let component: TradingSessionsComponent;
  let fixture: ComponentFixture<TradingSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradingSessionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradingSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
