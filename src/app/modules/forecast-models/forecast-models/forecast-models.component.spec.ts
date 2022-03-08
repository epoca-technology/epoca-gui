import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastModelsComponent } from './forecast-models.component';

describe('ForecastModelsComponent', () => {
  let component: ForecastModelsComponent;
  let fixture: ComponentFixture<ForecastModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForecastModelsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
