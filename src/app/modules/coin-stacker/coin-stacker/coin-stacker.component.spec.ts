import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinStackerComponent } from './coin-stacker.component';

describe('CoinStackerComponent', () => {
  let component: CoinStackerComponent;
  let fixture: ComponentFixture<CoinStackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoinStackerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinStackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
