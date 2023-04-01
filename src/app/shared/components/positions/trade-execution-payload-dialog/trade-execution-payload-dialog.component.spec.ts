import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeExecutionPayloadDialogComponent } from './trade-execution-payload-dialog.component';

describe('TradeExecutionPayloadDialogComponent', () => {
  let component: TradeExecutionPayloadDialogComponent;
  let fixture: ComponentFixture<TradeExecutionPayloadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradeExecutionPayloadDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeExecutionPayloadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
