import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegressionModelContentComponent } from './regression-model-content.component';

describe('RegressionModelContentComponent', () => {
  let component: RegressionModelContentComponent;
  let fixture: ComponentFixture<RegressionModelContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegressionModelContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegressionModelContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
