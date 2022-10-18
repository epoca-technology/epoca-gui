import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UninstallEpochComponent } from './uninstall-epoch.component';

describe('UninstallEpochComponent', () => {
  let component: UninstallEpochComponent;
  let fixture: ComponentFixture<UninstallEpochComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UninstallEpochComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UninstallEpochComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
