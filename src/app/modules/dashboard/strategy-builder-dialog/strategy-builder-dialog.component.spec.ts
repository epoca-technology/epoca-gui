import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyBuilderDialogComponent } from './strategy-builder-dialog.component';

describe('StrategyBuilderDialogComponent', () => {
  let component: StrategyBuilderDialogComponent;
  let fixture: ComponentFixture<StrategyBuilderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrategyBuilderDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyBuilderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
