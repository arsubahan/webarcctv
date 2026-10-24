import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClviewmotionComponent } from './clviewmotion.component';

describe('ClviewmotionComponent', () => {
  let component: ClviewmotionComponent;
  let fixture: ComponentFixture<ClviewmotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClviewmotionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClviewmotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
