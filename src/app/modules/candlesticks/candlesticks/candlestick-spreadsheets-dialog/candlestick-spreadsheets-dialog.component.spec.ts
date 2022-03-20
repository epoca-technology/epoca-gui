import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandlestickSpreadsheetsDialogComponent } from './candlestick-spreadsheets-dialog.component';

describe('CandlestickSpreadsheetsDialogComponent', () => {
  let component: CandlestickSpreadsheetsDialogComponent;
  let fixture: ComponentFixture<CandlestickSpreadsheetsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandlestickSpreadsheetsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandlestickSpreadsheetsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
