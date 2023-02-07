import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionHealthWeightsFormDialogComponent } from './position-health-weights-form-dialog.component';

describe('PositionHealthWeightsFormDialogComponent', () => {
  let component: PositionHealthWeightsFormDialogComponent;
  let fixture: ComponentFixture<PositionHealthWeightsFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionHealthWeightsFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionHealthWeightsFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
