import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WvhomeComponent } from './wvhome.component';

describe('WvhomeComponent', () => {
  let component: WvhomeComponent;
  let fixture: ComponentFixture<WvhomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WvhomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WvhomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
