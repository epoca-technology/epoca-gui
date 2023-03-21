import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyzonesPriceSnapshotsDialogComponent } from './keyzones-price-snapshots-dialog.component';

describe('KeyzonesPriceSnapshotsDialogComponent', () => {
  let component: KeyzonesPriceSnapshotsDialogComponent;
  let fixture: ComponentFixture<KeyzonesPriceSnapshotsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyzonesPriceSnapshotsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyzonesPriceSnapshotsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
