import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReversalStateDialogComponent } from './reversal-state-dialog.component';

describe('ReversalStateDialogComponent', () => {
  let component: ReversalStateDialogComponent;
  let fixture: ComponentFixture<ReversalStateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReversalStateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReversalStateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
