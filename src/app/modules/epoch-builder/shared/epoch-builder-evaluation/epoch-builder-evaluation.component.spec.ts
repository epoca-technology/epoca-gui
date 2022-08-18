import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpochBuilderEvaluationComponent } from './epoch-builder-evaluation.component';

describe('EpochBuilderEvaluationComponent', () => {
  let component: EpochBuilderEvaluationComponent;
  let fixture: ComponentFixture<EpochBuilderEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpochBuilderEvaluationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpochBuilderEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
