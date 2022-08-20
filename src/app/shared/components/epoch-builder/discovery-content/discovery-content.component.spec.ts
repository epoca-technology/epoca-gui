import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoveryContentComponent } from './discovery-content.component';

describe('DiscoveryContentComponent', () => {
  let component: DiscoveryContentComponent;
  let fixture: ComponentFixture<DiscoveryContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscoveryContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscoveryContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
