import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionModelContentComponent } from './prediction-model-content.component';

describe('PredictionModelContentComponent', () => {
  let component: PredictionModelContentComponent;
  let fixture: ComponentFixture<PredictionModelContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredictionModelContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionModelContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
