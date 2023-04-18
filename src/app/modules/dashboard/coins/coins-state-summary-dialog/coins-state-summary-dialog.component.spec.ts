import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinsStateSummaryDialogComponent } from './coins-state-summary-dialog.component';

describe('CoinsStateSummaryDialogComponent', () => {
  let component: CoinsStateSummaryDialogComponent;
  let fixture: ComponentFixture<CoinsStateSummaryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoinsStateSummaryDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinsStateSummaryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
