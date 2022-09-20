import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegressionElementComponent } from './regression-element.component';

describe('RegressionElementComponent', () => {
  let component: RegressionElementComponent;
  let fixture: ComponentFixture<RegressionElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegressionElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegressionElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
