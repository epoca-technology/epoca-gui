import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegressionTrainingCertificatesConfigDialogComponent } from './regression-training-certificates-config-dialog.component';

describe('RegressionTrainingCertificatesConfigDialogComponent', () => {
  let component: RegressionTrainingCertificatesConfigDialogComponent;
  let fixture: ComponentFixture<RegressionTrainingCertificatesConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegressionTrainingCertificatesConfigDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegressionTrainingCertificatesConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
