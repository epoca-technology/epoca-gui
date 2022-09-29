import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionModelConfigDialogComponent } from './prediction-model-config-dialog.component';

describe('PredictionModelConfigDialogComponent', () => {
  let component: PredictionModelConfigDialogComponent;
  let fixture: ComponentFixture<PredictionModelConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredictionModelConfigDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionModelConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
