import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandlesticksComponent } from './candlesticks.component';

describe('CandlesticksComponent', () => {
  let component: CandlesticksComponent;
  let fixture: ComponentFixture<CandlesticksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandlesticksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandlesticksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
