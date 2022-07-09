import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandlestickFilesDialogComponent } from './candlestick-files-dialog.component';

describe('CandlestickFilesDialogComponent', () => {
  let component: CandlestickFilesDialogComponent;
  let fixture: ComponentFixture<CandlestickFilesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandlestickFilesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandlestickFilesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
