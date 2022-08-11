import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelListDialogComponent } from './model-list-dialog.component';

describe('ModelListDialogComponent', () => {
  let component: ModelListDialogComponent;
  let fixture: ComponentFixture<ModelListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelListDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
