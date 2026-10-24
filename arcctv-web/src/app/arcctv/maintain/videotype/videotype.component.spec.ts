import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideotypeComponent } from './videotype.component';

describe('VideotypeComponent', () => {
  let component: VideotypeComponent;
  let fixture: ComponentFixture<VideotypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideotypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideotypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
