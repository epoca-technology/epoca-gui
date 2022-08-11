import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KerasClassificationsComponent } from './keras-classifications.component';

describe('KerasClassificationsComponent', () => {
  let component: KerasClassificationsComponent;
  let fixture: ComponentFixture<KerasClassificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KerasClassificationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KerasClassificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
