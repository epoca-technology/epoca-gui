import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XgbClassificationsComponent } from './xgb-classifications.component';

describe('XgbClassificationsComponent', () => {
  let component: XgbClassificationsComponent;
  let fixture: ComponentFixture<XgbClassificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XgbClassificationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(XgbClassificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
