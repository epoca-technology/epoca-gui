import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpochsMenuComponent } from './epochs-menu.component';

describe('EpochsMenuComponent', () => {
  let component: EpochsMenuComponent;
  let fixture: ComponentFixture<EpochsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpochsMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpochsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
