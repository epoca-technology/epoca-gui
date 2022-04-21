import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestPositionDialogComponent } from './backtest-position-dialog.component';

describe('BacktestPositionDialogComponent', () => {
  let component: BacktestPositionDialogComponent;
  let fixture: ComponentFixture<BacktestPositionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BacktestPositionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BacktestPositionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
