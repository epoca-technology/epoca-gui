import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionModelsComponent } from './prediction-models.component';

describe('PredictionModelsComponent', () => {
  let component: PredictionModelsComponent;
  let fixture: ComponentFixture<PredictionModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredictionModelsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
