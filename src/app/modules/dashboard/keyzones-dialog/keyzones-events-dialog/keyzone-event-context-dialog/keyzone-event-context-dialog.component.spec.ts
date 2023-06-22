import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyzoneEventContextDialogComponent } from './keyzone-event-context-dialog.component';

describe('KeyzoneEventContextDialogComponent', () => {
  let component: KeyzoneEventContextDialogComponent;
  let fixture: ComponentFixture<KeyzoneEventContextDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyzoneEventContextDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyzoneEventContextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
