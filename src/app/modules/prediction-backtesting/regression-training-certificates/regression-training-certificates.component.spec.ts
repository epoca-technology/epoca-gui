import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegressionTrainingCertificatesComponent } from './regression-training-certificates.component';

describe('RegressionTrainingCertificatesComponent', () => {
  let component: RegressionTrainingCertificatesComponent;
  let fixture: ComponentFixture<RegressionTrainingCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegressionTrainingCertificatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegressionTrainingCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
