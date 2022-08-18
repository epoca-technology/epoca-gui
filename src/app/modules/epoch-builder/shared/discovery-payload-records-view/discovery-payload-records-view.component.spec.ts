import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoveryPayloadRecordsViewComponent } from './discovery-payload-records-view.component';

describe('DiscoveryPayloadRecordsViewComponent', () => {
  let component: DiscoveryPayloadRecordsViewComponent;
  let fixture: ComponentFixture<DiscoveryPayloadRecordsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscoveryPayloadRecordsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscoveryPayloadRecordsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
