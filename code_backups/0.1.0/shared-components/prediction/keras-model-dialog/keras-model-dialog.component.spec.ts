import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KerasModelDialogComponent } from './keras-model-dialog.component';

describe('KerasModelDialogComponent', () => {
  let component: KerasModelDialogComponent;
  let fixture: ComponentFixture<KerasModelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KerasModelDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KerasModelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
