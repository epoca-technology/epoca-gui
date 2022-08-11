import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KerasRegressionElementComponent } from './keras-regression-element.component';

describe('KerasRegressionElementComponent', () => {
  let component: KerasRegressionElementComponent;
  let fixture: ComponentFixture<KerasRegressionElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KerasRegressionElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KerasRegressionElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
