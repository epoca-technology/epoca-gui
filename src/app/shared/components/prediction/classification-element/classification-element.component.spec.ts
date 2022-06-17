import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassificationElementComponent } from './classification-element.component';

describe('ClassificationElementComponent', () => {
  let component: ClassificationElementComponent;
  let fixture: ComponentFixture<ClassificationElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassificationElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
