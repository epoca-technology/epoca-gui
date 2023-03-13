import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyzoneDetailsDialogComponent } from './keyzone-details-dialog.component';

describe('KeyzoneDetailsDialogComponent', () => {
  let component: KeyzoneDetailsDialogComponent;
  let fixture: ComponentFixture<KeyzoneDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyzoneDetailsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyzoneDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
