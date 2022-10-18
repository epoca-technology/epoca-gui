import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallEpochComponent } from './install-epoch.component';

describe('InstallEpochComponent', () => {
  let component: InstallEpochComponent;
  let fixture: ComponentFixture<InstallEpochComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallEpochComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallEpochComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
