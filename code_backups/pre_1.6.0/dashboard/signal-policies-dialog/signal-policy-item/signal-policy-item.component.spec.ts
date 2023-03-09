import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalPolicyItemComponent } from './signal-policy-item.component';

describe('SignalPolicyItemComponent', () => {
  let component: SignalPolicyItemComponent;
  let fixture: ComponentFixture<SignalPolicyItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignalPolicyItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignalPolicyItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
