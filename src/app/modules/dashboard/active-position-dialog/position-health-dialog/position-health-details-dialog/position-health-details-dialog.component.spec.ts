import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionHealthDetailsDialogComponent } from './position-health-details-dialog.component';

describe('PositionHealthDetailsDialogComponent', () => {
  let component: PositionHealthDetailsDialogComponent;
  let fixture: ComponentFixture<PositionHealthDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionHealthDetailsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionHealthDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
