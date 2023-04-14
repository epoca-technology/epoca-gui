import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionContextDialogComponent } from './position-context-dialog.component';

describe('PositionContextDialogComponent', () => {
  let component: PositionContextDialogComponent;
  let fixture: ComponentFixture<PositionContextDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionContextDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionContextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
