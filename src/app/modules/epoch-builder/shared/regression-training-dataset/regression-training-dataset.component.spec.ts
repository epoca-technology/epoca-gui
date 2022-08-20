import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegressionTrainingDatasetComponent } from './regression-training-dataset.component';

describe('RegressionTrainingDatasetComponent', () => {
  let component: RegressionTrainingDatasetComponent;
  let fixture: ComponentFixture<RegressionTrainingDatasetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegressionTrainingDatasetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegressionTrainingDatasetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
