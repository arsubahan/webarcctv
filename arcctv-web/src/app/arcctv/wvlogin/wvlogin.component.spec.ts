import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WvloginComponent } from './wvlogin.component';

describe('WvloginComponent', () => {
  let component: WvloginComponent;
  let fixture: ComponentFixture<WvloginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WvloginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WvloginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
