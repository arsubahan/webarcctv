import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClcameraComponent } from './clcamera.component';

describe('ClcameraComponent', () => {
  let component: ClcameraComponent;
  let fixture: ComponentFixture<ClcameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClcameraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClcameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
