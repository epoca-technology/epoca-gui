import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiDiscoveryViewComponent } from './multi-discovery-view.component';

describe('MultiDiscoveryViewComponent', () => {
  let component: MultiDiscoveryViewComponent;
  let fixture: ComponentFixture<MultiDiscoveryViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiDiscoveryViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiDiscoveryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
