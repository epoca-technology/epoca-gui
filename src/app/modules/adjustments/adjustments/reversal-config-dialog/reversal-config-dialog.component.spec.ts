import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReversalConfigDialogComponent } from './reversal-config-dialog.component';

describe('ReversalConfigDialogComponent', () => {
  let component: ReversalConfigDialogComponent;
  let fixture: ComponentFixture<ReversalConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReversalConfigDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReversalConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
