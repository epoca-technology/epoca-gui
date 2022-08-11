import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XgbRegressionElementComponent } from './xgb-regression-element.component';

describe('XgbRegressionElementComponent', () => {
  let component: XgbRegressionElementComponent;
  let fixture: ComponentFixture<XgbRegressionElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XgbRegressionElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(XgbRegressionElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
