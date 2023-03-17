import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinsDialogComponent } from './coins-dialog.component';

describe('CoinsDialogComponent', () => {
  let component: CoinsDialogComponent;
  let fixture: ComponentFixture<CoinsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoinsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
