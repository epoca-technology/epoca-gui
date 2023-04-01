import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionHeadlinesDialogComponent } from './position-headlines-dialog.component';

describe('PositionHeadlinesDialogComponent', () => {
  let component: PositionHeadlinesDialogComponent;
  let fixture: ComponentFixture<PositionHeadlinesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PositionHeadlinesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionHeadlinesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
