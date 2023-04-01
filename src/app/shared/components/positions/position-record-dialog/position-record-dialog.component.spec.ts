import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionRecordDialogComponent } from './position-record-dialog.component';

describe('PositionRecordDialogComponent', () => {
  let component: PositionRecordDialogComponent;
  let fixture: ComponentFixture<PositionRecordDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionRecordDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionRecordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
