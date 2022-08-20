import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoveryPayloadViewComponent } from './discovery-payload-view.component';

describe('DiscoveryPayloadViewComponent', () => {
  let component: DiscoveryPayloadViewComponent;
  let fixture: ComponentFixture<DiscoveryPayloadViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscoveryPayloadViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscoveryPayloadViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
