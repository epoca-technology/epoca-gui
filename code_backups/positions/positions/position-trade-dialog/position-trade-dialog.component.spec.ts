import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionTradeDialogComponent } from './position-trade-dialog.component';

describe('PositionTradeDialogComponent', () => {
  let component: PositionTradeDialogComponent;
  let fixture: ComponentFixture<PositionTradeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionTradeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionTradeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
