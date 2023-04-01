import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionActionPayloadsDialogComponent } from './position-action-payloads-dialog.component';

describe('PositionActionPayloadsDialogComponent', () => {
  let component: PositionActionPayloadsDialogComponent;
  let fixture: ComponentFixture<PositionActionPayloadsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionActionPayloadsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionActionPayloadsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
