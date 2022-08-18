import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KerasHyperparamsViewComponent } from './keras-hyperparams-view.component';

describe('KerasHyperparamsViewComponent', () => {
  let component: KerasHyperparamsViewComponent;
  let fixture: ComponentFixture<KerasHyperparamsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KerasHyperparamsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KerasHyperparamsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
