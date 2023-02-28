import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionStateIntensityFormDialogComponent } from './prediction-state-intensity-form-dialog.component';

describe('PredictionStateIntensityFormDialogComponent', () => {
  let component: PredictionStateIntensityFormDialogComponent;
  let fixture: ComponentFixture<PredictionStateIntensityFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredictionStateIntensityFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionStateIntensityFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
