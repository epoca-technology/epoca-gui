import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KerasTrainingEpochsTableComponent } from './keras-training-epochs-table.component';

describe('KerasTrainingEpochsTableComponent', () => {
  let component: KerasTrainingEpochsTableComponent;
  let fixture: ComponentFixture<KerasTrainingEpochsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KerasTrainingEpochsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KerasTrainingEpochsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
