import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyzonesConfigFormDialogComponent } from './keyzones-config-form-dialog.component';

describe('KeyzonesConfigFormDialogComponent', () => {
  let component: KeyzonesConfigFormDialogComponent;
  let fixture: ComponentFixture<KeyzonesConfigFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyzonesConfigFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyzonesConfigFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
