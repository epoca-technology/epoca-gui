import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyzonesEventsDialogComponent } from './keyzones-events-dialog.component';

describe('KeyzonesEventsDialogComponent', () => {
  let component: KeyzonesEventsDialogComponent;
  let fixture: ComponentFixture<KeyzonesEventsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyzonesEventsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyzonesEventsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
