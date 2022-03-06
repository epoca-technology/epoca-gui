import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandlestickDialogComponent } from './candlestick-dialog.component';

describe('CandlestickDialogComponent', () => {
  let component: CandlestickDialogComponent;
  let fixture: ComponentFixture<CandlestickDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandlestickDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandlestickDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
