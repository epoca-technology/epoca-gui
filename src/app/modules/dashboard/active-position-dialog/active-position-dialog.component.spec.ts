import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivePositionDialogComponent } from './active-position-dialog.component';

describe('ActivePositionDialogComponent', () => {
  let component: ActivePositionDialogComponent;
  let fixture: ComponentFixture<ActivePositionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivePositionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivePositionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
