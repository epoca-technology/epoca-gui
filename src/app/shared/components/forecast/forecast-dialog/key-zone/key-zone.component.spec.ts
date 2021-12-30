import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyZoneComponent } from './key-zone.component';

describe('KeyZoneComponent', () => {
  let component: KeyZoneComponent;
  let fixture: ComponentFixture<KeyZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyZoneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
