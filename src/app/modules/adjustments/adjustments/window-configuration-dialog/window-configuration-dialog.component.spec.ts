import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowConfigurationDialogComponent } from './window-configuration-dialog.component';

describe('WindowConfigurationDialogComponent', () => {
  let component: WindowConfigurationDialogComponent;
  let fixture: ComponentFixture<WindowConfigurationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WindowConfigurationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WindowConfigurationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
