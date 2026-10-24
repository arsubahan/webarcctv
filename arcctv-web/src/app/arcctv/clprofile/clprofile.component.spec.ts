import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClprofileComponent } from './clprofile.component';

describe('ClprofileComponent', () => {
  let component: ClprofileComponent;
  let fixture: ComponentFixture<ClprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClprofileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
