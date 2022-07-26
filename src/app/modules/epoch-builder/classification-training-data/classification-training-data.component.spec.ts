import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassificationTrainingDataComponent } from './classification-training-data.component';

describe('ClassificationTrainingDataComponent', () => {
  let component: ClassificationTrainingDataComponent;
  let fixture: ComponentFixture<ClassificationTrainingDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassificationTrainingDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationTrainingDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
