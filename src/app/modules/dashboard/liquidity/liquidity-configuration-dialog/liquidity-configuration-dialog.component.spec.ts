import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidityConfigurationDialogComponent } from './liquidity-configuration-dialog.component';

describe('LiquidityConfigurationDialogComponent', () => {
  let component: LiquidityConfigurationDialogComponent;
  let fixture: ComponentFixture<LiquidityConfigurationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiquidityConfigurationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidityConfigurationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
