import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketStateComponent } from './market-state.component';

describe('MarketStateComponent', () => {
  let component: MarketStateComponent;
  let fixture: ComponentFixture<MarketStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketStateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
