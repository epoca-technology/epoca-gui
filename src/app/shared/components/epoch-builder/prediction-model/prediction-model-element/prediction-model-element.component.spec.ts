import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionModelElementComponent } from './prediction-model-element.component';

describe('PredictionModelElementComponent', () => {
  let component: PredictionModelElementComponent;
  let fixture: ComponentFixture<PredictionModelElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredictionModelElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionModelElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
