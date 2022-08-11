import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KerasRegressionsComponent } from './keras-regressions.component';

describe('KerasRegressionsComponent', () => {
  let component: KerasRegressionsComponent;
  let fixture: ComponentFixture<KerasRegressionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KerasRegressionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KerasRegressionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
