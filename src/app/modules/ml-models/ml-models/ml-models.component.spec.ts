import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlModelsComponent } from './ml-models.component';

describe('MlModelsComponent', () => {
  let component: MlModelsComponent;
  let fixture: ComponentFixture<MlModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MlModelsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MlModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
