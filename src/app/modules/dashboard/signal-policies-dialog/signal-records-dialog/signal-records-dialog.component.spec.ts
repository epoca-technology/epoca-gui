import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalRecordsDialogComponent } from './signal-records-dialog.component';

describe('SignalRecordsDialogComponent', () => {
  let component: SignalRecordsDialogComponent;
  let fixture: ComponentFixture<SignalRecordsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignalRecordsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignalRecordsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
