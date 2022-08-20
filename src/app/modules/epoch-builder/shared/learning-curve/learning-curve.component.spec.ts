import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningCurveComponent } from './learning-curve.component';

describe('LearningCurveComponent', () => {
  let component: LearningCurveComponent;
  let fixture: ComponentFixture<LearningCurveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LearningCurveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
