import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespasswordComponent } from './respassword.component';

describe('RespasswordComponent', () => {
  let component: RespasswordComponent;
  let fixture: ComponentFixture<RespasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RespasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RespasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
