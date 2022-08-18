import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpochBuilderConfigDialogComponent } from './epoch-builder-config-dialog.component';

describe('EpochBuilderConfigDialogComponent', () => {
  let component: EpochBuilderConfigDialogComponent;
  let fixture: ComponentFixture<EpochBuilderConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpochBuilderConfigDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpochBuilderConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
