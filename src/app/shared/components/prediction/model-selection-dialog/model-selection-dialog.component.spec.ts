import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelSelectionDialogComponent } from './model-selection-dialog.component';

describe('ModelSelectionDialogComponent', () => {
  let component: ModelSelectionDialogComponent;
  let fixture: ComponentFixture<ModelSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelSelectionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
