import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmsConfigDialogComponent } from './alarms-config-dialog.component';

describe('AlarmsConfigDialogComponent', () => {
  let component: AlarmsConfigDialogComponent;
  let fixture: ComponentFixture<AlarmsConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlarmsConfigDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmsConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
