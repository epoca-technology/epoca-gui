import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketStateDialogComponent } from './market-state-dialog.component';

describe('MarketStateDialogComponent', () => {
  let component: MarketStateDialogComponent;
  let fixture: ComponentFixture<MarketStateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketStateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketStateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
