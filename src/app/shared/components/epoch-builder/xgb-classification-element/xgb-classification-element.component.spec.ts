import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XgbClassificationElementComponent } from './xgb-classification-element.component';

describe('XgbClassificationElementComponent', () => {
  let component: XgbClassificationElementComponent;
  let fixture: ComponentFixture<XgbClassificationElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XgbClassificationElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(XgbClassificationElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
