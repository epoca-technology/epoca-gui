import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpochsComponent } from './epochs.component';

describe('EpochsComponent', () => {
  let component: EpochsComponent;
  let fixture: ComponentFixture<EpochsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpochsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpochsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
