import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpBlacklistComponent } from './ip-blacklist.component';

describe('IpBlacklistComponent', () => {
  let component: IpBlacklistComponent;
  let fixture: ComponentFixture<IpBlacklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IpBlacklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IpBlacklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
