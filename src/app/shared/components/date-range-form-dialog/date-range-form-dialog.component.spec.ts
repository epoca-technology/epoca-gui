import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateRangeFormDialogComponent } from './date-range-form-dialog.component';

describe('DateRangeFormDialogComponent', () => {
  let component: DateRangeFormDialogComponent;
  let fixture: ComponentFixture<DateRangeFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateRangeFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateRangeFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
