import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassificationFeaturesDialogComponent } from './classification-features-dialog.component';

describe('ClassificationFeaturesDialogComponent', () => {
  let component: ClassificationFeaturesDialogComponent;
  let fixture: ComponentFixture<ClassificationFeaturesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassificationFeaturesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationFeaturesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
