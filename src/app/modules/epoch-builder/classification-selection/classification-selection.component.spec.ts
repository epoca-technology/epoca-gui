import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassificationSelectionComponent } from './classification-selection.component';

describe('ClassificationSelectionComponent', () => {
  let component: ClassificationSelectionComponent;
  let fixture: ComponentFixture<ClassificationSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassificationSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
