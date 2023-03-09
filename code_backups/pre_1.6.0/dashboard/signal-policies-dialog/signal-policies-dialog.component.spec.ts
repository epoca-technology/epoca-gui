import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalPoliciesDialogComponent } from './signal-policies-dialog.component';

describe('SignalPoliciesDialogComponent', () => {
  let component: SignalPoliciesDialogComponent;
  let fixture: ComponentFixture<SignalPoliciesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignalPoliciesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignalPoliciesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
