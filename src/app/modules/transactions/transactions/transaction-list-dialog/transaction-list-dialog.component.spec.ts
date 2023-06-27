import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionListDialogComponent } from './transaction-list-dialog.component';

describe('TransactionListDialogComponent', () => {
  let component: TransactionListDialogComponent;
  let fixture: ComponentFixture<TransactionListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionListDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
