import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionDataItemDialogComponent } from './position-data-item-dialog.component';

describe('PositionDataItemDialogComponent', () => {
  let component: PositionDataItemDialogComponent;
  let fixture: ComponentFixture<PositionDataItemDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionDataItemDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionDataItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
