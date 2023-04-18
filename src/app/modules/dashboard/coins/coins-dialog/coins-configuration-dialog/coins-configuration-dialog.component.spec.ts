import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinsConfigurationDialogComponent } from './coins-configuration-dialog.component';

describe('CoinsConfigurationDialogComponent', () => {
  let component: CoinsConfigurationDialogComponent;
  let fixture: ComponentFixture<CoinsConfigurationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoinsConfigurationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinsConfigurationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
