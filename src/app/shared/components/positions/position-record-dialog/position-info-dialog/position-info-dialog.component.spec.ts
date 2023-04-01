import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionInfoDialogComponent } from './position-info-dialog.component';

describe('PositionInfoDialogComponent', () => {
  let component: PositionInfoDialogComponent;
  let fixture: ComponentFixture<PositionInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionInfoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
