import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyzoneStateDialogComponent } from './keyzone-state-dialog.component';

describe('KeyzoneStateDialogComponent', () => {
  let component: KeyzoneStateDialogComponent;
  let fixture: ComponentFixture<KeyzoneStateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyzoneStateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyzoneStateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
