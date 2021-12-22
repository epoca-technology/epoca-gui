import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecaptchaDialogComponent } from './recaptcha-dialog.component';

describe('RecaptchaDialogComponent', () => {
  let component: RecaptchaDialogComponent;
  let fixture: ComponentFixture<RecaptchaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecaptchaDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecaptchaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
