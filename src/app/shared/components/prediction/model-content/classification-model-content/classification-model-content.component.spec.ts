import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassificationModelContentComponent } from './classification-model-content.component';

describe('ClassificationModelContentComponent', () => {
  let component: ClassificationModelContentComponent;
  let fixture: ComponentFixture<ClassificationModelContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassificationModelContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationModelContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
