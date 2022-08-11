import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassificationFeaturesContentComponent } from './classification-features-content.component';

describe('ClassificationFeaturesContentComponent', () => {
  let component: ClassificationFeaturesContentComponent;
  let fixture: ComponentFixture<ClassificationFeaturesContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassificationFeaturesContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationFeaturesContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
