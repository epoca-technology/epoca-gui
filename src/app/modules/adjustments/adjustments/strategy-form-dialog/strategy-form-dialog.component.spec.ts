import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyFormDialogComponent } from './strategy-form-dialog.component';

describe('StrategyFormDialogComponent', () => {
  let component: StrategyFormDialogComponent;
  let fixture: ComponentFixture<StrategyFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrategyFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
