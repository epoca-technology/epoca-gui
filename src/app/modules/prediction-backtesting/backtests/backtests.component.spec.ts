import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestsComponent } from './backtests.component';

describe('BacktestsComponent', () => {
  let component: BacktestsComponent;
  let fixture: ComponentFixture<BacktestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BacktestsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BacktestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
