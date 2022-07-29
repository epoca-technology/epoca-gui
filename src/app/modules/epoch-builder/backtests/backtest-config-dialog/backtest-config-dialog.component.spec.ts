import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacktestConfigDialogComponent } from './backtest-config-dialog.component';

describe('BacktestConfigDialogComponent', () => {
  let component: BacktestConfigDialogComponent;
  let fixture: ComponentFixture<BacktestConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BacktestConfigDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BacktestConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
