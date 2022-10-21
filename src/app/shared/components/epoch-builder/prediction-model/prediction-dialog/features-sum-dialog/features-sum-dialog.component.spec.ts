import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesSumDialogComponent } from './features-sum-dialog.component';

describe('FeaturesSumDialogComponent', () => {
  let component: FeaturesSumDialogComponent;
  let fixture: ComponentFixture<FeaturesSumDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturesSumDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturesSumDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
