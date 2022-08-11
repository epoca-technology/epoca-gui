import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XgbModelDialogComponent } from './xgb-model-dialog.component';

describe('XgbModelDialogComponent', () => {
  let component: XgbModelDialogComponent;
  let fixture: ComponentFixture<XgbModelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XgbModelDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(XgbModelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
