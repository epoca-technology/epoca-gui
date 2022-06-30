import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArimaModelContentComponent } from './arima-model-content.component';

describe('ArimaModelContentComponent', () => {
  let component: ArimaModelContentComponent;
  let fixture: ComponentFixture<ArimaModelContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArimaModelContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArimaModelContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
