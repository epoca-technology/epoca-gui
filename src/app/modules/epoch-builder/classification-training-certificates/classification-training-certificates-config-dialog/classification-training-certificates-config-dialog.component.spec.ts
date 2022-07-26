import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassificationTrainingCertificatesConfigDialogComponent } from './classification-training-certificates-config-dialog.component';

describe('ClassificationTrainingCertificatesConfigDialogComponent', () => {
  let component: ClassificationTrainingCertificatesConfigDialogComponent;
  let fixture: ComponentFixture<ClassificationTrainingCertificatesConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassificationTrainingCertificatesConfigDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationTrainingCertificatesConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
