import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationflComponent } from './locationfl.component';

describe('LocationflComponent', () => {
  let component: LocationflComponent;
  let fixture: ComponentFixture<LocationflComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationflComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationflComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
