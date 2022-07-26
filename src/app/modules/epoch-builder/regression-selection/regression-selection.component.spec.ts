import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegressionSelectionComponent } from './regression-selection.component';

describe('RegressionSelectionComponent', () => {
  let component: RegressionSelectionComponent;
  let fixture: ComponentFixture<RegressionSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegressionSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegressionSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
