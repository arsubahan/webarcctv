import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClhomeComponent } from './clhome.component';

describe('ClhomeComponent', () => {
  let component: ClhomeComponent;
  let fixture: ComponentFixture<ClhomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClhomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClhomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
