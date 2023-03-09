import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalAnalysisDialogComponent } from './technical-analysis-dialog.component';

describe('TechnicalAnalysisDialogComponent', () => {
  let component: TechnicalAnalysisDialogComponent;
  let fixture: ComponentFixture<TechnicalAnalysisDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TechnicalAnalysisDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TechnicalAnalysisDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
