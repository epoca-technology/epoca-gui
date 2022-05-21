import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassificationTrainingCertificatesComponent } from './classification-training-certificates.component';

describe('ClassificationTrainingCertificatesComponent', () => {
  let component: ClassificationTrainingCertificatesComponent;
  let fixture: ComponentFixture<ClassificationTrainingCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassificationTrainingCertificatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationTrainingCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
