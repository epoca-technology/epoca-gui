import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyzoneReversalsDialogComponent } from './keyzone-reversals-dialog.component';

describe('KeyzoneReversalsDialogComponent', () => {
  let component: KeyzoneReversalsDialogComponent;
  let fixture: ComponentFixture<KeyzoneReversalsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyzoneReversalsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyzoneReversalsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
