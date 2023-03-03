import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyzonesDialogComponent } from './keyzones-dialog.component';

describe('KeyzonesDialogComponent', () => {
  let component: KeyzonesDialogComponent;
  let fixture: ComponentFixture<KeyzonesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyzonesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyzonesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
