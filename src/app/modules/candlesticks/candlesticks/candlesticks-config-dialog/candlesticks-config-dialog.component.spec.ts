import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandlesticksConfigDialogComponent } from './candlesticks-config-dialog.component';

describe('CandlesticksConfigDialogComponent', () => {
  let component: CandlesticksConfigDialogComponent;
  let fixture: ComponentFixture<CandlesticksConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandlesticksConfigDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandlesticksConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
