import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XgbRegressionsComponent } from './xgb-regressions.component';

describe('XgbRegressionsComponent', () => {
  let component: XgbRegressionsComponent;
  let fixture: ComponentFixture<XgbRegressionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XgbRegressionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(XgbRegressionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
