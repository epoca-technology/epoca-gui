import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionHealthDialogComponent } from './position-health-dialog.component';

describe('PositionHealthDialogComponent', () => {
  let component: PositionHealthDialogComponent;
  let fixture: ComponentFixture<PositionHealthDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionHealthDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionHealthDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
