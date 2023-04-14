import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendConfigurationDialogComponent } from './trend-configuration-dialog.component';

describe('TrendConfigurationDialogComponent', () => {
  let component: TrendConfigurationDialogComponent;
  let fixture: ComponentFixture<TrendConfigurationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrendConfigurationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendConfigurationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
