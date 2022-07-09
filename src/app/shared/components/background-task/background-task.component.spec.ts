import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundTaskComponent } from './background-task.component';

describe('BackgroundTaskComponent', () => {
  let component: BackgroundTaskComponent;
  let fixture: ComponentFixture<BackgroundTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BackgroundTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
