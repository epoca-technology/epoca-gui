import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidityDialogComponent } from './liquidity-dialog.component';

describe('LiquidityDialogComponent', () => {
  let component: LiquidityDialogComponent;
  let fixture: ComponentFixture<LiquidityDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiquidityDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
