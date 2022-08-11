import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KerasClassificationElementComponent } from './keras-classification-element.component';

describe('KerasClassificationElementComponent', () => {
  let component: KerasClassificationElementComponent;
  let fixture: ComponentFixture<KerasClassificationElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KerasClassificationElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KerasClassificationElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
