import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoveryViewComponent } from './discovery-view.component';

describe('DiscoveryViewComponent', () => {
  let component: DiscoveryViewComponent;
  let fixture: ComponentFixture<DiscoveryViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscoveryViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscoveryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
